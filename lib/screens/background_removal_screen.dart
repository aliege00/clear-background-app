import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../services/background_removal_service.dart';
import '../widgets/checkerboard_painter.dart';

class BackgroundRemovalScreen extends StatefulWidget {
  const BackgroundRemovalScreen({super.key});

  @override
  State<BackgroundRemovalScreen> createState() =>
      _BackgroundRemovalScreenState();
}

class _BackgroundRemovalScreenState extends State<BackgroundRemovalScreen> {
  File? _originalFile;
  File? _resultFile;
  bool _isProcessing = false;
  String? _error;

  // Before/After slider
  double _sliderPosition = 0.5; // 0.0 = tamamı orijinal, 1.0 = tamamı sonuç
  final GlobalKey _imageKey = GlobalKey();

  final _picker = ImagePicker();

  // ── Fotoğraf Seçimi ────────────────────────────────────────

  Future<void> _pickFromGallery() async {
    var status = await Permission.photos.request();
    if (!status.isGranted && !status.isLimited) {
      status = await Permission.storage.request();
      if (!status.isGranted && !status.isLimited) {
        _showSnack('Galeri izni gerekli');
        return;
      }
    }

    final image = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 2048,
      maxHeight: 2048,
    );
    if (image != null) _onImageSelected(File(image.path));
  }

  Future<void> _pickFromCamera() async {
    final status = await Permission.camera.request();
    if (!status.isGranted) {
      _showSnack('Kamera izni gerekli');
      return;
    }

    final image = await _picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 2048,
      maxHeight: 2048,
    );
    if (image != null) _onImageSelected(File(image.path));
  }

  void _onImageSelected(File file) {
    setState(() {
      _originalFile = file;
      _resultFile = null;
      _error = null;
      _sliderPosition = 0.5;
    });
  }

  // ── Arka Plan Kaldırma ─────────────────────────────────────

  Future<void> _processImage() async {
    if (_originalFile == null) return;

    final bgService = context.read<BackgroundRemovalService>();
    if (!bgService.isModelLoaded) {
      setState(() => _error = 'Model yüklenmedi. Uygulamayı yeniden başlatın.');
      return;
    }

    setState(() {
      _isProcessing = true;
      _error = null;
    });

    try {
      final result = await bgService.removeBackground(_originalFile!);
      if (mounted) {
        setState(() {
          _resultFile = result;
          _isProcessing = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _error = 'İşleme başarısız: $e';
        });
      }
    }
  }

  // ── Kaydet / Paylaş ────────────────────────────────────────

  Future<void> _saveImage() async {
    if (_resultFile == null) return;

    // Paylaş sheet kullanarak galeriye kaydet
    try {
      await Share.shareXFiles(
        [XFile(_resultFile!.path)],
        text: 'Arka Plan Silindi — Arka Plan Uygulaması',
      );
    } catch (e) {
      _showSnack('Kaydetme başarısız');
    }
  }

  Future<void> _shareImage() async {
    if (_resultFile == null) return;
    try {
      await Share.shareXFiles(
        [XFile(_resultFile!.path)],
        text: 'Arka Plan Silindi — Arka Plan Uygulaması',
      );
    } catch (e) {
      // Paylaşma iptal edildi veya başarısız
    }
  }

  void _reset() {
    setState(() {
      _originalFile = null;
      _resultFile = null;
      _error = null;
      _sliderPosition = 0.5;
    });
  }

  void _showSnack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  // ── Build ──────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: _originalFile == null && !_isProcessing
          ? _buildUploadArea(context, isDark)
          : _buildProcessingArea(context, isDark),
    );
  }

  // ══════════════════════════════════════════════════════════
  // YÜKLEME ALANI (Fotoğraf henüz seçilmedi)
  // ══════════════════════════════════════════════════════════

  Widget _buildUploadArea(BuildContext context, bool isDark) {
    return Column(
      children: [
        const SizedBox(height: 32),
        GestureDetector(
          onTap: _pickFromGallery,
          child: _buildUploadCard(isDark),
        ),
        const SizedBox(height: 24),
        _buildFeatureBadges(isDark),
      ],
    );
  }

  Widget _buildUploadCard(bool isDark) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 52, horizontal: 24),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.03) : Colors.black.withOpacity(0.02),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.08),
          width: 1.5,
        ),
      ),
      child: Column(
        children: [
          Container(
            width: 56, height: 56,
            decoration: BoxDecoration(
              color: isDark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              Icons.add_photo_alternate_outlined,
              size: 26,
              color: isDark ? Colors.white54 : Colors.black38,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Fotoğrafınızı buraya bırakın',
            style: TextStyle(
              fontSize: 14, fontWeight: FontWeight.w500,
              color: isDark ? Colors.white70 : Colors.black87,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'veya galeriden seçin · PNG, JPG, WebP',
            style: TextStyle(
              fontSize: 12,
              color: isDark ? Colors.white38 : Colors.black38,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildPickButton(
                icon: Icons.photo_library_outlined,
                label: 'Galeri',
                onTap: _pickFromGallery,
                isDark: isDark,
              ),
              const SizedBox(width: 10),
              _buildPickButton(
                icon: Icons.camera_alt_outlined,
                label: 'Kamera',
                onTap: _pickFromCamera,
                isDark: isDark,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPickButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isDark ? Colors.white.withOpacity(0.1) : Colors.black.withOpacity(0.1),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: isDark ? Colors.white60 : Colors.black45),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12, fontWeight: FontWeight.w500,
                color: isDark ? Colors.white60 : Colors.black45,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureBadges(bool isDark) {
    return Row(
      children: [
        _buildBadge(Icons.lock_outline, 'Tamamen\nÇevrimdışı', isDark),
        const SizedBox(width: 8),
        _buildBadge(Icons.bolt_outlined, 'Anında\nİşlem', isDark),
        const SizedBox(width: 8),
        _buildBadge(Icons.all_inclusive, 'Sınırsız\nKullanım', isDark),
      ],
    );
  }

  Widget _buildBadge(IconData icon, String label, bool isDark) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isDark ? Colors.white.withOpacity(0.03) : Colors.black.withOpacity(0.02),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            Icon(icon, size: 20, color: isDark ? Colors.white54 : Colors.black38),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11, fontWeight: FontWeight.w500,
                color: isDark ? Colors.white54 : Colors.black45,
                height: 1.3,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  // İŞLEM / SONUÇ ALANI
  // ══════════════════════════════════════════════════════════

  Widget _buildProcessingArea(BuildContext context, bool isDark) {
    return Column(
      children: [
        const SizedBox(height: 8),

        // Görsel Önizleme + Slider
        _buildImagePreview(context, isDark),

        const SizedBox(height: 16),

        // Hata mesajı
        if (_error != null) _buildErrorBanner(isDark),

        // Butonlar
        if (_resultFile != null && !_isProcessing) ...[
          _buildResultButtons(isDark),
        ] else if (_originalFile != null && !_isProcessing && _resultFile == null) ...[
          _buildProcessButton(isDark),
        ],

        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildImagePreview(BuildContext context, bool isDark) {
    final hasResult = _resultFile != null && !_isProcessing;

    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: Stack(
        children: [
          // Arka plan: Checkerboard (şeffaflık gösterimi)
          if (hasResult)
            AspectRatio(
              aspectRatio: 4 / 3,
              child: CustomPaint(
                painter: CheckerboardPainter(isDark: isDark),
              ),
            ),

          // ── BEFORE / AFTER SLIDER ──
          if (hasResult)
            _buildBeforeAfterSlider(context, isDark)
          else if (_isProcessing)
            _buildProcessingOverlay(isDark)
          else if (_originalFile != null)
            AspectRatio(
              aspectRatio: 4 / 3,
              child: Image.file(_originalFile!, fit: BoxFit.contain),
            ),

          // Kapat butonu
          if (_originalFile != null && !_isProcessing)
            Positioned(
              top: 12, right: 12,
              child: GestureDetector(
                onTap: _reset,
                child: Container(
                  width: 32, height: 32,
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.close, size: 16, color: Colors.white),
                ),
              ),
            ),
        ],
      ),
    );
  }

  /// Öncesi/Sonrası sürüklenebilir karşılaştırma
  Widget _buildBeforeAfterSlider(BuildContext context, bool isDark) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final imageWidth = constraints.maxWidth;
        return GestureDetector(
          onHorizontalDragUpdate: (details) {
            setState(() {
              _sliderPosition =
                  (details.localPosition.dx / imageWidth).clamp(0.0, 1.0);
            });
          },
          child: SizedBox(
            width: imageWidth,
            height: imageWidth * 3 / 4,
            child: Stack(
              children: [
                // Tamamı: Sonuç (alt tabaka)
                Positioned.fill(
                  child: Image.file(_resultFile!, fit: BoxFit.contain),
                ),

                // Sol taraf: Orijinal (clip ile)
                ClipRect(
                  clipper: _SliderClipper(_sliderPosition),
                  child: SizedBox(
                    width: imageWidth,
                    height: imageWidth * 3 / 4,
                    child: Image.file(_originalFile!, fit: BoxFit.contain),
                  ),
                ),

                // Divider çizgisi
                Positioned(
                  top: 0, bottom: 0,
                  left: imageWidth * _sliderPosition - 1,
                  child: Container(
                    width: 2,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.3),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                  ),
                ),

                // Slider tutamağı
                Positioned(
                  top: 0, bottom: 0,
                  left: imageWidth * _sliderPosition - 16,
                  child: Center(
                    child: Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.2),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.swap_horiz,
                        size: 16,
                        color: Color(0xFF1A1A2E),
                      ),
                    ),
                  ),
                ),

                // Etiketler
                Positioned(
                  top: 12, left: 12,
                  child: _buildLabel('Önce', isDark),
                ),
                Positioned(
                  top: 12, right: 12,
                  child: _buildLabel('Sonra', isDark),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildLabel(String text, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.6),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 10, fontWeight: FontWeight.w600, color: Colors.white,
        ),
      ),
    );
  }

  Widget _buildProcessingOverlay(bool isDark) {
    return AspectRatio(
      aspectRatio: 4 / 3,
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (_originalFile != null)
            Image.file(_originalFile!, fit: BoxFit.contain),
          Container(
            color: (isDark ? Colors.black : Colors.white).withOpacity(0.85),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 48, height: 48,
                    child: CircularProgressIndicator(
                      strokeWidth: 3,
                      color: isDark ? Colors.white : const Color(0xFF1A1A2E),
                      backgroundColor: isDark ? Colors.white12 : Colors.black12,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Arka plan kaldırılıyor…',
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark ? Colors.white70 : Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorBanner(bool isDark) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, size: 16, color: Colors.red),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _error!,
              style: const TextStyle(fontSize: 12, color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultButtons(bool isDark) {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: FilledButton.icon(
            onPressed: _saveImage,
            icon: const Icon(Icons.download_rounded, size: 18),
            label: const Text(
              'Galeriye Kaydet',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
            ),
            style: FilledButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _shareImage,
                icon: const Icon(Icons.share_outlined, size: 16),
                label: const Text('Paylaş', style: TextStyle(fontSize: 13)),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: OutlinedButton(
                onPressed: _reset,
                child: const Text('Yeni Fotoğraf', style: TextStyle(fontSize: 13)),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildProcessButton(bool isDark) {
    return SizedBox(
      width: double.infinity,
      child: FilledButton(
        onPressed: _processImage,
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: const Text(
          'Arka Planı Kaldır',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
        ),
      ),
    );
  }
}

/// Slider'ın sol tarafını clip'leyen custom clipper.
class _SliderClipper extends CustomClipper<Rect> {
  final double position;
  _SliderClipper(this.position);

  @override
  Rect getClip(Size size) {
    return Rect.fromLTWH(0, 0, size.width * position, size.height);
  }

  @override
  bool shouldReclip(_SliderClipper old) => old.position != position;
}
