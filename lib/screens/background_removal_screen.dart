import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../services/background_removal_service.dart';

class BackgroundRemovalScreen extends StatefulWidget {
  const BackgroundRemovalScreen({super.key});

  @override
  State<BackgroundRemovalScreen> createState() =>
      _BackgroundRemovalScreenState();
}

class _BackgroundRemovalScreenState extends State<BackgroundRemovalScreen> {
  File? _originalImage;
  File? _resultImage;
  bool _showComparison = false;
  bool _isProcessing = false;
  double _progress = 0;
  String? _error;

  final _picker = ImagePicker();

  // ── File Picking ──

  Future<void> _pickFromGallery() async {
    final status = await Permission.photos.request();
    if (!status.isGranted && !status.isLimited) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Galeri izni gerekli')),
        );
      }
      return;
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
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Kamera izni gerekli')),
        );
      }
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
      _originalImage = file;
      _resultImage = null;
      _showComparison = false;
      _error = null;
    });
  }

  // ── Background Removal ──

  Future<void> _processImage() async {
    if (_originalImage == null) return;

    final bgService = context.read<BackgroundRemovalService>();
    if (!bgService.isModelLoaded) {
      setState(() {
        _error = 'Model yüklenmedi. Lütfen uygulamayı yeniden başlatın.';
      });
      return;
    }

    setState(() {
      _isProcessing = true;
      _progress = 0;
      _error = null;
    });

    // Simulate progress (real progress from ONNX would be better)
    _simulateProgress();

    try {
      final result = await bgService.removeBackground(_originalImage!);
      if (mounted) {
        setState(() {
          _resultImage = result;
          _isProcessing = false;
          _progress = 1.0;
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

  void _simulateProgress() async {
    for (var i = 0; i < 10 && _isProcessing; i++) {
      await Future.delayed(const Duration(milliseconds: 200));
      if (mounted && _isProcessing) {
        setState(() => _progress = (i + 1) / 10 * 0.9);
      }
    }
  }

  // ── Save & Share ──

  Future<void> _saveImage() async {
    if (_resultImage == null) return;

    final status = await Permission.photos.request();
    if (!status.isGranted && !status.isLimited) {
      // Try storage permission for older Android
      final storageStatus = await Permission.storage.request();
      if (!storageStatus.isGranted) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Kaydetme izni gerekli')),
          );
        }
        return;
      }
    }

    // Copy to gallery using share sheet as fallback
    await Share.shareXFiles(
      [XFile(_resultImage!.path)],
      text: 'Arka Plan Silindi',
    );
  }

  Future<void> _shareImage() async {
    if (_resultImage == null) return;
    await Share.shareXFiles(
      [XFile(_resultImage!.path)],
      text: 'Arka Plan Silindi',
    );
  }

  void _reset() {
    setState(() {
      _originalImage = null;
      _resultImage = null;
      _showComparison = false;
      _error = null;
      _progress = 0;
    });
  }

  // ── UI ──

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: _originalImage == null && !_isProcessing
          ? _buildUploadArea(context, isDark)
          : _buildProcessingArea(context, isDark),
    );
  }

  // ── Upload State ──

  Widget _buildUploadArea(BuildContext context, bool isDark) {
    return Column(
      children: [
        const SizedBox(height: 40),

        // Upload Card
        GestureDetector(
          onTap: _pickFromGallery,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 56, horizontal: 24),
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withOpacity(0.03)
                  : Colors.black.withOpacity(0.02),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isDark
                    ? Colors.white.withOpacity(0.08)
                    : Colors.black.withOpacity(0.08),
                width: 1.5,
                strokeAlign: BorderSide.strokeAlignInside,
              ),
            ),
            child: Column(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.white.withOpacity(0.08)
                        : Colors.black.withOpacity(0.05),
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
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
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
                    _buildActionChip(
                      icon: Icons.photo_library_outlined,
                      label: 'Galeri',
                      onTap: _pickFromGallery,
                      isDark: isDark,
                    ),
                    const SizedBox(width: 10),
                    _buildActionChip(
                      icon: Icons.camera_alt_outlined,
                      label: 'Kamera',
                      onTap: _pickFromCamera,
                      isDark: isDark,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 32),

        // Feature highlights
        Row(
          children: [
            _buildFeatureBadge(
              icon: Icons.lock_outline,
              label: 'Tamamen\nÇevrimdışı',
              isDark: isDark,
            ),
            const SizedBox(width: 8),
            _buildFeatureBadge(
              icon: Icons.bolt_outlined,
              label: 'Anında\nİşlem',
              isDark: isDark,
            ),
            const SizedBox(width: 8),
            _buildFeatureBadge(
              icon: Icons.all_inclusive,
              label: 'Sınırsız\nKullanım',
              isDark: isDark,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionChip({
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
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: isDark ? Colors.white60 : Colors.black45,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureBadge({
    required IconData icon,
    required String label,
    required bool isDark,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isDark
              ? Colors.white.withOpacity(0.03)
              : Colors.black.withOpacity(0.02),
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
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: isDark ? Colors.white54 : Colors.black45,
                height: 1.3,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Processing / Result State ──

  Widget _buildProcessingArea(BuildContext context, bool isDark) {
    return Column(
      children: [
        const SizedBox(height: 8),

        // Image Preview
        ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Stack(
            children: [
              // Image display
              if (_resultImage != null && !_showComparison)
                // Checkerboard + transparent result
                AspectRatio(
                  aspectRatio: 4 / 3,
                  child: CustomPaint(
                    painter: CheckerboardPainter(isDark: isDark),
                    child: Image.file(
                      _resultImage!,
                      fit: BoxFit.contain,
                      width: double.infinity,
                    ),
                  ),
                )
              else if (_resultImage != null && _showComparison)
                // Before / After comparison
                AspectRatio(
                  aspectRatio: 4 / 3,
                  child: Stack(
                    children: [
                      // Original (full)
                      Positioned.fill(
                        child: Image.file(
                          _originalImage!,
                          fit: BoxFit.contain,
                        ),
                      ),
                      // Result (clipped to left half)
                      ClipRect(
                        clipper: const _HalfClipper(),
                        child: Image.file(
                          _resultImage!,
                          fit: BoxFit.contain,
                          width: double.infinity,
                        ),
                      ),
                      // Divider line
                      Positioned(
                        top: 0,
                        bottom: 0,
                        left: MediaQuery.of(context).size.width * 0.5 - 1,
                        child: Container(
                          width: 2,
                          color: Colors.white.withOpacity(0.8),
                        ),
                      ),
                      // Labels
                      Positioned(
                        top: 12,
                        left: 12,
                        child: _buildLabel('Orijinal', isDark),
                      ),
                      Positioned(
                        top: 12,
                        right: 12,
                        child: _buildLabel('Sonuç', isDark),
                      ),
                    ],
                  ),
                )
              else if (_originalImage != null)
                // Original with processing overlay
                AspectRatio(
                  aspectRatio: 4 / 3,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Image.file(_originalImage!, fit: BoxFit.contain),
                      if (_isProcessing)
                        Container(
                          color: (isDark ? Colors.black : Colors.white)
                              .withOpacity(0.85),
                          child: Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                SizedBox(
                                  width: 48,
                                  height: 48,
                                  child: CircularProgressIndicator(
                                    value: _progress,
                                    strokeWidth: 3,
                                    color: isDark ? Colors.white : const Color(0xFF1A1A2E),
                                    backgroundColor: isDark
                                        ? Colors.white12
                                        : Colors.black12,
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
                                const SizedBox(height: 4),
                                Text(
                                  '${(_progress * 100).toInt()}%',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: isDark ? Colors.white38 : Colors.black26,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

              // Close button
              if (_originalImage != null && !_isProcessing)
                Positioned(
                  top: 12,
                  right: 12,
                  child: GestureDetector(
                    onTap: _reset,
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.5),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.close,
                        size: 16,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Error state
        if (_error != null) ...[
          Container(
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
          ),
          const SizedBox(height: 12),
        ],

        // Action buttons
        if (_resultImage != null && !_isProcessing) ...[
          // Compare toggle
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () =>
                  setState(() => _showComparison = !_showComparison),
              icon: Icon(
                _showComparison ? Icons.visibility : Icons.compare,
                size: 16,
              ),
              label: Text(
                _showComparison
                    ? 'Sonucu Gör'
                    : 'Önce / Sonra Karşılaştır',
                style: const TextStyle(fontSize: 13),
              ),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Save + Share
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: _saveImage,
                  icon: const Icon(Icons.download_rounded, size: 18),
                  label: const Text(
                    'PNG olarak kaydet',
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
              const SizedBox(width: 10),
              OutlinedButton.icon(
                onPressed: _shareImage,
                icon: const Icon(Icons.share_outlined, size: 18),
                label: const Text('Paylaş'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Start over
          TextButton(
            onPressed: _reset,
            child: const Text(
              'Başka bir fotoğraf işle',
              style: TextStyle(fontSize: 13),
            ),
          ),
        ],

        // Start processing button
        if (_originalImage != null && !_isProcessing && _resultImage == null)
          SizedBox(
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
          ),

        const SizedBox(height: 20),
      ],
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
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),
    );
  }
}

/// Clips to the left half for the before/after comparison.
class _HalfClipper extends CustomClipper<Rect> {
  const _HalfClipper();

  @override
  Rect getClip(Size size) {
    return Rect.fromLTWH(0, 0, size.width / 2, size.height);
  }

  @override
  bool shouldReclip(covariant CustomClipper<Rect> oldClipper) => false;
}
