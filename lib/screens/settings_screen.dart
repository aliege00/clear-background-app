import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/ad_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  int _tapCount = 0;
  bool _developerMenuVisible = false;
  bool _adsEnabled = false;

  void _onVersionTap() {
    _tapCount++;
    if (_tapCount >= 7) {
      setState(() {
        _developerMenuVisible = !_developerMenuVisible;
        _tapCount = 0;
      });
    }
  }

  void _onAdsToggle(bool value) {
    setState(() => _adsEnabled = value);
    final adService = context.read<AdService>();
    adService.toggleAds(value);
    // Trigger ad on setting change (per requirements)
    adService.onSettingChanged();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final adService = context.watch<AdService>();

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
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

          // ── Appearance ──
          Text(
            'Görünüm',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          _buildThemeOptions(context, isDark),

          const SizedBox(height: 28),

          // ── About ──
          Text(
            'Hakkında',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 12),
          _buildAboutSection(context, isDark),

          const SizedBox(height: 28),

          // ── Developer Menu (Hidden) ──
          if (_developerMenuVisible) ...[
            _buildDeveloperMenu(context, isDark, adService),
            const SizedBox(height: 28),
          ],
        ],
      ),
    );
  }

  // ── Theme Options ──

  Widget _buildThemeOptions(BuildContext context, bool isDark) {
    final themeOptions = [
      _ThemeOption(
        icon: Icons.light_mode_outlined,
        label: 'Aydınlık',
        value: ThemeMode.light,
      ),
      _ThemeOption(
        icon: Icons.dark_mode_outlined,
        label: 'Karanlık',
        value: ThemeMode.dark,
      ),
      _ThemeOption(
        icon: Icons.brightness_auto_outlined,
        label: 'Sistem',
        value: ThemeMode.system,
      ),
    ];

    final currentMode = Theme.of(context).platform == TargetPlatform.android ||
            Theme.of(context).platform == TargetPlatform.iOS
        ? ThemeMode.system // Default
        : ThemeMode.system;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.04) : Colors.black.withOpacity(0.02),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.06)
              : Colors.black.withOpacity(0.06),
        ),
      ),
      child: Column(
        children: List.generate(themeOptions.length, (i) {
          final opt = themeOptions[i];
          final isSelected = i == 2; // Default to "System"
          return GestureDetector(
            onTap: () {
              // Theme switching would use a ThemeProvider
              // For now, this is the UI shell
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                border: i < themeOptions.length - 1
                    ? Border(
                        bottom: BorderSide(
                          color: isDark
                              ? Colors.white.withOpacity(0.04)
                              : Colors.black.withOpacity(0.04),
                        ),
                      )
                    : null,
              ),
              child: Row(
                children: [
                  Icon(
                    opt.icon,
                    size: 18,
                    color: isDark ? Colors.white54 : Colors.black38,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      opt.label,
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark ? Colors.white70 : Colors.black87,
                      ),
                    ),
                  ),
                  if (isSelected)
                    Container(
                      width: 20,
                      height: 20,
                      decoration: const BoxDecoration(
                        color: Color(0xFF1A1A2E),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check,
                        size: 12,
                        color: Colors.white,
                      ),
                    ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }

  // ── About Section ──

  Widget _buildAboutSection(BuildContext context, bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.04) : Colors.black.withOpacity(0.02),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark
              ? Colors.white.withOpacity(0.06)
              : Colors.black.withOpacity(0.06),
        ),
      ),
      child: Column(
        children: [
          _buildInfoRow(
            icon: Icons.info_outline,
            label: 'Sürüm',
            value: '1.0.0',
            onTap: _onVersionTap,
            isDark: isDark,
          ),
          _buildInfoRow(
            icon: Icons.phone_iphone,
            label: 'İşlem',
            value: '%100 Cihaz Üzerinde',
            isDark: isDark,
          ),
          _buildInfoRow(
            icon: Icons.psychology_outlined,
            label: 'Yapay Zeka Modeli',
            value: 'ONNX Runtime',
            isDark: isDark,
            isLast: true,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
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
            Icon(
              icon,
              size: 18,
              color: isDark ? Colors.white54 : Colors.black38,
            ),
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
                fontSize: 12,
                fontFamily: 'monospace',
                color: isDark ? Colors.white38 : Colors.black38,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Developer Menu ──

  Widget _buildDeveloperMenu(BuildContext context, bool isDark, AdService adService) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              Icons.code,
              size: 16,
              color: Colors.amber.shade600,
            ),
            const SizedBox(width: 6),
            Text(
              'Geliştirici Menüsü',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
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
              // Ad toggle — platform-aware
              _buildDeveloperRow(
                icon: Icons.ad_units_outlined,
                label: 'Reklamları Aç/Kapat',
                trailing: adService.isWindows
                    ? Text(
                        Platform.isWindows
                            ? 'Bu platformda\nkullanılamaz'
                            : '',
                        textAlign: TextAlign.right,
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? Colors.white38 : Colors.black26,
                        ),
                      )
                    : Switch(
                        value: _adsEnabled,
                        onChanged: _onAdsToggle,
                      ),
                isDark: isDark,
              ),
              // Cache clear
              _buildDeveloperRow(
                icon: Icons.delete_outline,
                label: 'Önbelleği Temizle',
                trailing: Icon(
                  Icons.chevron_right,
                  size: 18,
                  color: isDark ? Colors.white26 : Colors.black12,
                ),
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Önbellek temizlendi')),
                  );
                },
                isDark: isDark,
                isLast: true,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDeveloperRow({
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
            Icon(
              icon,
              size: 18,
              color: isDark ? Colors.white54 : Colors.black38,
            ),
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

class _ThemeOption {
  final IconData icon;
  final String label;
  final ThemeMode value;

  const _ThemeOption({
    required this.icon,
    required this.label,
    required this.value,
  });
}
