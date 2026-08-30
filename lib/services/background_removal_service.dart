import 'dart:io';
import 'dart:math';
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:image/image.dart' as img;
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

// ─────────────────────────────────────────────────────────────
// Not: tflite_flutter Interpreter'ı isolate içinde çalıştırılamaz
// (FFI kısıtı). Bu yüzden isolate'e ham görüntü verisini gönderip
// sonucu geri alıyoruz. Model inference, ana isolate'de ama
// görsel decode/encode işlemleri isolate'te yapılıyor.
// Gerçek model init'i main isolate'te, ağır görsel işlemleri
// compute() ile workeredale ediyoruz.
// ─────────────────────────────────────────────────────────────

class BackgroundRemovalService extends ChangeNotifier {
  // tflite_flutter Interpreter TODO: model yükleme
  bool _isModelLoaded = false;
  bool _isProcessing = false;
  String? _error;
  String _modelName = 'U2Net-Lite (TFLite)';
  String _modelInputSize = '512×512';
  String _modelQuantization = 'Float32';

  bool get isModelLoaded => _isModelLoaded;
  bool get isProcessing => _isProcessing;
  String? get error => _error;
  String get modelName => _modelName;
  String get modelInputSize => _modelInputSize;
  String get modelQuantization => _modelQuantization;

  /// Modeli yükle — uygulama başlangıcında bir kez çağrılır.
  Future<void> loadModel() async {
    try {
      // TODO: tflite_flutter Interpreter.fromAsset('u2net_lite.tflite')
      // Gerçek implementasyonda:
      //
      // import 'package:tflite_flutter/tflite_flutter.dart';
      // late Interpreter _interpreter;
      // _interpreter = await Interpreter.fromAsset('u2net_lite.tflite');
      //
      _isModelLoaded = true;
      _modelName = 'U2Net-Lite (TFLite)';
      _modelInputSize = '512×512';
      _modelQuantization = 'Float32';
      notifyListeners();
    } catch (e) {
      _error = 'Model yüklenemedi: $e';
      _isModelLoaded = false;
      notifyListeners();
    }
  }

  /// Arka planı kaldır — ağır görsel işlemleri isolate'te çalışır.
  Future<File> removeBackground(File imageFile) async {
    _isProcessing = true;
    _error = null;
    notifyListeners();

    try {
      // 1. Görseli encode edip isolate'e gönder
      final inputBytes = await imageFile.readAsBytes();

      // 2. İşlemi isolate'te çalıştır
      final resultBytes = await compute(
        _processImageIsolate,
        _IsolateParams(
          imageBytes: inputBytes,
          modelInputSize: 512,
          maxProcessDim: 1024,
        ),
      );

      // 3. Sonucu dosyaya yaz
      final appDir = await getApplicationDocumentsDirectory();
      final outputPath = p.join(
        appDir.path,
        'result_${DateTime.now().millisecondsSinceEpoch}.png',
      );
      final outputFile = File(outputPath);
      await outputFile.writeAsBytes(resultBytes);

      _isProcessing = false;
      notifyListeners();
      return outputFile;
    } catch (e) {
      _error = 'İşleme başarısız: $e';
      _isProcessing = false;
      notifyListeners();
      rethrow;
    }
  }

  void reset() {
    _error = null;
    _isProcessing = false;
    notifyListeners();
  }
}

// ── Isolated Image Processing ────────────────────────────────

class _IsolateParams {
  final Uint8List imageBytes;
  final int modelInputSize;
  final int maxProcessDim;

  _IsolateParams({
    required this.imageBytes,
    required this.modelInputSize,
    required this.maxProcessDim,
  });
}

/// Bu fonksiyon compute() içinde, ayrı isolate'te çalışır.
/// Ana thread'i hiç bloklemez.
Uint8List _processImageIsolate(_IsolateParams params) {
  // 1. Görseli decode et
  final original = img.decodeImage(params.imageBytes);
  if (original == null) throw Exception('Görsel decode edilemedi');

  // 2. Model için yeniden boyutlandır (uzun kenar ~1024px)
  final resized = _resizeForModel(original, params.maxProcessDim);

  // 3. Model input boyutuna yeniden boyutlandır
  final modelInput = img.copyResize(
    resized,
    width: params.modelInputSize,
    height: params.modelInputSize,
    interpolation: img.Interpolation.linear,
  );

  // 4. Model inference — U2Net-lite hardcoded mask üretimi
  //    (Gerçek implementasyonda tflite_flutter Interpreter.run() kullanılır)
  //
    // Gerçek kullanım:
    //   final input = _imageToFloat32(modelInput, params.modelInputSize);
    //   final output = List.filled(params.modelInputSize * params.modelInputSize, 0.0)
    //       .reshape([1, params.modelInputSize, params.modelInputSize, 1]);
    //   _interpreter.run(input, output);
    //   final mask = output[0].flatten();
    //
  final mask = _generateSegmentationMask(modelInput, params.modelInputSize);

  // 5. Maskeyi orijinal çözünürlüğe uygula + şeffaf PNG oluştur
  final result = _applyMaskToOriginal(original, mask, params.modelInputSize);

  // 6. PNG olarak encode et
  return Uint8List.fromList(img.encodePng(result));
}

/// Orijinal görseli model için optimize eder (uzun kenar maxDim'e küçültür).
img.Image _resizeForModel(img.Image image, int maxDim) {
  if (image.width <= maxDim && image.height <= maxDim) return image;
  final ratio = min(maxDim / image.width, maxDim / image.height);
  return img.copyResize(
    image,
    width: (image.width * ratio).round(),
    height: (image.height * ratio).round(),
    interpolation: img.Interpolation.linear,
  );
}

/// Resimden ham float tensor oluşturur [H, W, 3].
Float32List _imageToFloat32(img.Image image, int size) {
  final tensor = Float32List(size * size * 3);
  var idx = 0;
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      final pixel = image.getPixel(x, y);
      tensor[idx++] = pixel.r / 255.0;
      tensor[idx++] = pixel.g / 255.0;
      tensor[idx++] = pixel.b / 255.0;
    }
  }
  return tensor;
}

/// Yer tutucu segmentasyon maskesi (gerçek model inference yerine kullanılır).
/// Gerçek kullanımda tflite_flutter Interpreter çıktısıyla değiştirilmelidir.
Float32List _generateSegmentationMask(img.Image image, int size) {
  final mask = Float32List(size * size);
  // Basit merkez bazlı segmentasyon: görselin ortasındaki parlak bölgeleri
  // ön plan olarak algılar. Gerçek U2Net modeli çok daha doğru sonuç verir.
  final cx = size / 2.0;
  final cy = size / 2.0;
  final maxDist = sqrt(cx * cx + cy * cy);

  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      final pixel = image.getPixel(x, y);
      final brightness = (pixel.r + pixel.g + pixel.b) / (3.0 * 255.0);
      final dx = x - cx;
      final dy = y - cy;
      final distFactor = 1.0 - (sqrt(dx * dx + dy * dy) / maxDist);
      final combined = (brightness * 0.5 + distFactor * 0.5);
      mask[y * size + x] = combined > 0.35 ? 1.0 : 0.0;
    }
  }
  return mask;
}

/// Maskeyi orijinal çözünürlükteki görsele uygulayarak şeffaf PNG üretir.
img.Image _applyMaskToOriginal(
  img.Image original,
  Float32List mask,
  int inputSize,
) {
  final result = img.Image(
    width: original.width,
    height: original.height,
    numChannels: 4,
  );

  final scaleX = original.width / inputSize;
  final scaleY = original.height / inputSize;

  for (var y = 0; y < original.height; y++) {
    for (var x = 0; x < original.width; x++) {
      final maskX = (x / scaleX).floor().clamp(0, inputSize - 1);
      final maskY = (y / scaleY).floor().clamp(0, inputSize - 1);
      final maskVal = mask[maskY * inputSize + maskX];
      final alpha = maskVal > 0.5 ? 255 : 0;

      final src = original.getPixel(x, y);
      result.setPixelRgba(x, y, src.r.toInt(), src.g.toInt(), src.b.toInt(), alpha);
    }
  }

  return result;
}
