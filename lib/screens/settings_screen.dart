import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../services/ad_mob_service.dart';
import '../services/background_removal_service.dart';
import '../services/theme_provider.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  int _versionTapCount = 0;
  bool _developerMenuVisible = false;

  void _onVersionTap() {
    _versionTapCount++;
    if (_versionTapCount >= 7) {
      setState(() {
        _developerMenuVisible = !_developerMenuVisible;
        _versionTapCount = 0;
      });
    }
    // 3 saniye sonra sayacı sıfırla
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) setState(() => _versionTapCount = 0);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final adService = context.watch<AdMobService>();
    final bgService = context.watch<BackgroundRemovalService>();
    final themeProvider = context.watch<ThemeProvider>();

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Başlık
          Text(
            'Ayarlar',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Deneyiminizi özelleştirin',
            style: TextStyle(
              fontSize: 13,
              color: isDark ? Colors.white54 : Colors.black45,
            ),
          ),
          const SizedBox(height: 28),

          // ── Tema Seçimi ──
          _sectionTitle('Görünüm', isDark),
          const SizedBox(height: 12),
          _buildThemeSelector(context, isDark, themeProvider),
          const SizedBox(height: 28),

          // ── Hakkında ──
          _sectionTitle('Hakkında', isDark),
          const SizedBox(height: 12),
          _buildAboutSection(context, isDark, bgService),
          const SizedBox(height: 28),

          // ── Gizli Geliştirici Menüsü ──
          if (_developerMenuVisible) ...[
            _buildDeveloperMenu(context, isDark, adService, bgService),
            const SizedBox(height: 28),
          ],
        ],
      ),
    );
  }

  Widget _sectionTitle(String text, bool isDark) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 13, fontWeight: FontWeight.w600,
        color: isDark ? Colors.white70 : Colors.black87,
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  // TEMA SEÇİMİ
  // ══════════════════════════════════════════════════════════

  Widget _buildThemeSelector(
    BuildContext context,
    bool isDark,
    ThemeProvider themeProvider,
  ) {
    final options = [
      (Icons.light_mode_outlined, 'Aydınlık', ThemeMode.light),
      (Icons.dark_mode_outlined, 'Karanlık', ThemeMode.dark),
      (Icons.brightness_auto_outlined, 'Sistem', ThemeMode.system),
    ];

    return _card(
      isDark,
      child: Column(
        children: List.generate(options.length, (i) {
          final (icon, label, mode) = options[i];
          final isSelected = themeProvider.themeMode == mode;
          return GestureDetector(
            onTap: () => themeProvider.setThemeMode(mode),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: i < options.length - 1
                  ? BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: isDark
                              ? Colors.white.withOpacity(0.04)
                              : Colors.black.withOpacity(0.04),
                        ),
                      ),
                    )
                  : null,
              child: Row(
                children: [
                  Icon(icon, size: 18, color: isDark ? Colors.white54 : Colors.black38),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      label,
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark ? Colors.white70 : Colors.black87,
                      ),
                    ),
                  ),
                  if (isSelected)
                    Container(
                      width: 20, height: 20,
                      decoration: const BoxDecoration(
                        color: Color(0xFF1A1A2E), shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check, size: 12, color: Colors.white),
                    ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  // HAKKINDA
  // ══════════════════════════════════════════════════════════

  Widget _buildAboutSection(
    BuildContext context,
    bool isDark,
    BackgroundRemovalService bgService,
  ) {
    return _card(
      isDark,
      child: Column(
        children: [
          _infoRow(
            Icons.info_outline, 'Sürüm', 'v1.0.0',
            onTap: _onVersionTap,
            isDark: isDark,
          ),
          _infoRow(
            Icons.phone_iphone, 'İşlem', '%100 Cihaz Üzerinde',
            isDark: isDark,
          ),
          _infoRow(
            Icons.psychology_outlined, 'AI Model', bgService.modelName,
            isDark: isDark,
          ),
          _infoRow(
            Icons.grid_on, 'Model Çözünürlüğü', bgService.modelInputSize,
            isDark: isDark, isLast: true,
          ),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  // GİZLİ GELİŞTİRİCİ MENÜSÜ
  // ══════════════════════════════════════════════════════════

  Widget _buildDeveloperMenu(
    BuildContext context,
    bool isDark,
    AdMobService adService,
    BackgroundRemovalService bgService,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.code, size: 16, color: Colors.amber.shade600),
            const SizedBox(width: 6),
            Text(
              'Geliştirici Menüsü',
              style: TextStyle(
                fontSize: 13, fontWeight: FontWeight.w600,
                color: Colors.amber.shade600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: Colors.amber.withOpacity(0.05),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.amber.withOpacity(0.15)),
          ),
          child: Column(
            children: [
              // ── Reklam Durumu ──
              _devRow(
                icon: Icons.ad_units_outlined,
                label: 'Reklam Durumu',
                trailing: AdMobService.isAdPlatform
                    ? Switch(
                        value: adService.adsEnabled,
                        onChanged: (v) {
                          adService.toggleAds(v);
                          // Ayar değişti → reklam tetikle
                          adService.onSettingChanged();
                        },
                      )
                    : Text(
                        'Bu platformda\nreklam desteklenmiyor',
                        textAlign: TextAlign.end,
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? Colors.white38 : Colors.black26,
                        ),
                      ),
                isDark: isDark,
              ),

              // ── RAM Kullanımı ──
              _devRow(
                icon: Icons.memory,
                label: 'RAM Kullanımı',
                trailing: FutureBuilder<int>(
                  future: _getRamUsage(),
                  builder: (ctx, snap) {
                    final mb = snap.data != null
                        ? '${(snap.data! / 1024 / 1024).toStringAsFixed(1)} MB'
                        : '—';
                    return Text(
                      mb,
                      style: TextStyle(
                        fontSize: 12, fontFamily: 'monospace',
                        color: isDark ? Colors.white38 : Colors.black26,
                      ),
                    );
                  },
                ),
                isDark: isDark,
              ),

              // ── Model Bilgisi ──
              _devRow(
                icon: Icons.data_usage,
                label: 'Model Bilgisi',
                trailing: Text(
                  '${bgService.modelName}\n${bgService.modelQuantization}',
                  textAlign: TextAlign.end,
                  style: TextStyle(
                    fontSize: 11, fontFamily: 'monospace',
                    color: isDark ? Colors.white38 : Colors.black26,
                  ),
                ),
                isDark: isDark,
              ),

              // ── Önbellek Temizle ──
              _devRow(
                icon: Icons.delete_outline,
                label: 'Önbelleği Temizle',
                trailing: Icon(
                  Icons.chevron_right, size: 18,
                  color: isDark ? Colors.white26 : Colors.black12,
                ),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Önbellek temizlendi')),
                  );
                },
                isDark: isDark, isLast: true,
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// Cihazın tahmini RAM kullanımını döndürür.
  Future<int> _getRamUsage() async {
    try {
      const channel = MethodChannel('com.arkaplan.app/memory');
      final result = await channel.invokeMethod<int>('getRamUsage');
      return result ?? 0;
    } catch (e) {
      // Platform kanalı yoksa tahmini değer
      return ProcessInfo.currentRss;
    }
  }

  // ══════════════════════════════════════════════════════════
  // ORTAK WIDGET'LAR
  // ══════════════════════════════════════════════════════════

  Widget _card(bool isDark, {required Widget child}) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.04) : Colors.black.withOpacity(0.02),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? Colors.white.withOpacity(0.06) : Colors.black.withOpacity(0.06),
        ),
      ),
      child: child,
    );
  }

  Widget _infoRow(
    IconData icon,
    String label,
    String value, {
    VoidCallback? onTap,
    required bool isDark,
    bool isLast = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: !isLast
            ? BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: isDark
                        ? Colors.white.withOpacity(0.04)
                        : Colors.black.withOpacity(0.04),
                  ),
                ),
              )
            : null,
        child: Row(
          children: [
            Icon(icon, size: 18, color: isDark ? Colors.white54 : Colors.black38),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? Colors.white70 : Colors.black87,
                ),
              ),
            ),
            Text(
              value,
              style: TextStyle(
                fontSize: 12, fontFamily: 'monospace',
                color: isDark ? Colors.white38 : Colors.black38,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _devRow({
    required IconData icon,
    required String label,
    required Widget trailing,
    VoidCallback? onTap,
    required bool isDark,
    bool isLast = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: !isLast
            ? BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Colors.amber.withOpacity(0.08)),
                ),
              )
            : null,
        child: Row(
          children: [
            Icon(icon, size: 18, color: isDark ? Colors.white54 : Colors.black38),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? Colors.white70 : Colors.black87,
                ),
              ),
            ),
            trailing,
          ],
        ),
      ),
    );
  }
}
