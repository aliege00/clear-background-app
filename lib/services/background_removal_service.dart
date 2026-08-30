import 'dart:io';
import 'dart:math';
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:image/image.dart' as img;
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:tflite_flutter/tflite_flutter.dart';

/// ─────────────────────────────────────────────────────────────
/// Arka plan kaldırma servisi — tflite_flutter ile.
///
/// Interpreter FFI kısıtı nedeniyle isolate içinde çalıştırılamaz.
/// Mimari:
///   1) compute() → görseli decode et, 512×512 float32 tensor üret
///   2) ana thread → Interpreter.run() ile model inference
///   3) compute() → alpha maskesini orijinal görsele uygula, PNG encode
/// ─────────────────────────────────────────────────────────────
class BackgroundRemovalService extends ChangeNotifier {
  Interpreter? _interpreter;
  bool _isModelLoaded = false;
  bool _isProcessing = false;
  String? _error;

  bool get isModelLoaded => _isModelLoaded;
  bool get isProcessing => _isProcessing;
  String? get error => _error;
  String get modelName => 'U2Net-Lite (TFLite)';
  String get modelInputSize => '512×512';
  String get modelQuantization => 'Float32';

  /// Modeli belleğe yükle — uygulama başlangıcında bir kez çağrılır.
  Future<void> loadModel() async {
    try {
      _interpreter = await Interpreter.fromAsset(
        'u2net_lite.tflite',
        options: InterpreterOptions()..threads = 4,
      );
      _isModelLoaded = true;
      notifyListeners();
    } catch (e) {
      _error = 'Model yüklenemedi: $e';
      _isModelLoaded = false;
      notifyListeners();
    }
  }

  /// Arka planı kaldır — 3 aşamalı pipeline.
  Future<File> removeBackground(File imageFile) async {
    if (_interpreter == null) {
      throw Exception('Model yüklenmedi');
    }

    _isProcessing = true;
    _error = null;
    notifyListeners();

    try {
      // Aşama 1: Görseli decode et, modele uygun tensor üret (isolate)
      final inputBytes = await imageFile.readAsBytes();
      final preprocessed = await compute(
        _preprocessImage,
        _PreprocessParams(imageBytes: inputBytes, inputSize: 512),
      );

      // Aşama 2: Model inference (ana thread — FFI kısıtı)
      final maskOutput = _runInference(preprocessed.tensor);

      // Aşama 3: Maskeyi orijinal görsele uygula, PNG encode et (isolate)
      final resultBytes = await compute(
        _postprocessImage,
        _PostprocessParams(
          originalBytes: inputBytes,
          mask: maskOutput,
          inputSize: 512,
          originalWidth: preprocessed.originalWidth,
          originalHeight: preprocessed.originalHeight,
        ),
      );

      // Sonucu diske yaz
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

  /// TFLite model inference — ana isolate'de çalışır (FFI).
  Float32List _runInference(Float32List inputTensor) {
    final inputSize = 512;
    final outputSize = inputSize * inputSize;

    // Model girdisi: [1, 512, 512, 3] Float32
    final input = inputTensor.reshape([1, inputSize, inputSize, 3]);

    // Model çıktısı: [1, 512, 512, 1] Float32 (alpha maskesi)
    final output = List.filled(outputSize, 0.0)
        .reshape([1, inputSize, inputSize, 1]);

    _interpreter!.run(input, output);

    // 3D→1D düzleştir
    return Float32List.fromList(
      (output[0] as List<List<List<double>>>)
          .expand((row) => row)
          .expand((pixel) => pixel)
          .toList(),
    );
  }

  void reset() {
    _error = null;
    _isProcessing = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _interpreter?.close();
    super.dispose();
  }
}

// ══════════════════════════════════════════════════════════════
// ISOLATE FONKSİYONLARI (compute() içinde çalışır)
// ══════════════════════════════════════════════════════════════

class _PreprocessParams {
  final Uint8List imageBytes;
  final int inputSize;
  _PreprocessParams({required this.imageBytes, required this.inputSize});
}

class _PreprocessResult {
  final Float32List tensor;
  final int originalWidth;
  final int originalHeight;
  _PreprocessResult(this.tensor, this.originalWidth, this.originalHeight);
}

/// Aşama 1: Görseli decode → resize → float32 tensor [1, H, W, 3].
_PreprocessResult _preprocessImage(_PreprocessParams params) {
  final original = img.decodeImage(params.imageBytes);
  if (original == null) throw Exception('Görsel decode edilemedi');

  final origW = original.width;
  final origH = original.height;

  // Uzun kenarı 1024px'e küçült (performans)
  final intermediate = _resizeKeepAspect(original, 1024);

  // Model input boyutuna yeniden boyutlandır
  final resized = img.copyResize(
    intermediate,
    width: params.inputSize,
    height: params.inputSize,
    interpolation: img.Interpolation.linear,
  );

  // Float32 tensor [H, W, 3] → flatten
  final tensor = _imageToFloat32(resized, params.inputSize);

  return _PreprocessResult(tensor, origW, origH);
}

class _PostprocessParams {
  final Uint8List originalBytes;
  final Float32List mask;
  final int inputSize;
  final int originalWidth;
  final int originalHeight;
  _PostprocessParams({
    required this.originalBytes,
    required this.mask,
    required this.inputSize,
    required this.originalWidth,
    required this.originalHeight,
  });
}

/// Aşama 3: Orijinal görsele maskeyi uygula → RGBA PNG encode.
Uint8List _postprocessImage(_PostprocessParams params) {
  final original = img.decodeImage(params.originalBytes);
  if (original == null) throw Exception('Orijinal görsel decode edilemedi');

  final result = img.Image(
    width: params.originalWidth,
    height: params.originalHeight,
    numChannels: 4,
  );

  final scaleX = params.originalWidth / params.inputSize;
  final scaleY = params.originalHeight / params.inputSize;

  for (var y = 0; y < params.originalHeight; y++) {
    for (var x = 0; x < params.originalWidth; x++) {
      final maskX = (x / scaleX).floor().clamp(0, params.inputSize - 1);
      final maskY = (y / scaleY).floor().clamp(0, params.inputSize - 1);
      final maskVal = params.mask[maskY * params.inputSize + maskX];
      final alpha = maskVal > 0.5 ? 255 : 0;

      final src = original.getPixel(x, y);
      result.setPixelRgba(
        x, y,
        src.r.toInt(), src.g.toInt(), src.b.toInt(), alpha,
      );
    }
  }

  return Uint8List.fromList(img.encodePng(result));
}

// ── Yardımcı Fonksiyonlar ─────────────────────────────────

img.Image _resizeKeepAspect(img.Image image, int maxDim) {
  if (image.width <= maxDim && image.height <= maxDim) return image;
  final ratio = min(maxDim / image.width, maxDim / image.height);
  return img.copyResize(
    image,
    width: (image.width * ratio).round(),
    height: (image.height * ratio).round(),
    interpolation: img.Interpolation.linear,
  );
}

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
