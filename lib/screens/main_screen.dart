import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/theme_provider.dart';
import 'background_removal_screen.dart';
import 'help_center_screen.dart';
import 'settings_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  static const _tabLabels = ['Arka Plan Silme', 'Yardım', 'Ayarlar'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // ── Üst Bar: Logo + Başlık ──
            _buildTopBar(context, isDark),

            // ── Sekme Çubuğu ──
            _buildTabBar(context, isDark),

            // ── Sekme İçerikleri ──
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: const [
                  BackgroundRemovalScreen(),
                  HelpCenterScreen(),
                  SettingsScreen(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar(BuildContext context, bool isDark) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
      child: Row(
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: isDark ? Colors.white : const Color(0xFF1A1A2E),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              Icons.auto_fix_high_rounded,
              size: 17,
              color: isDark ? const Color(0xFF0F0F14) : Colors.white,
            ),
          ),
          const SizedBox(width: 10),
          Text(
            'Arka Plan',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              letterSpacing: -0.3,
            ),
          ),
          const Spacer(),
          // Tema değiştirme butonu (sağ üst)
          _buildThemeToggle(context, isDark),
        ],
      ),
    );
  }

  Widget _buildThemeToggle(BuildContext context, bool isDark) {
    final themeProvider = context.read<ThemeProvider>();
    return GestureDetector(
      onTap: () {
        final next = switch (themeProvider.themeMode) {
          ThemeMode.system => ThemeMode.light,
          ThemeMode.light => ThemeMode.dark,
          ThemeMode.dark => ThemeMode.system,
        };
        themeProvider.setThemeMode(next);
      },
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: isDark
              ? Colors.white.withOpacity(0.08)
              : Colors.black.withOpacity(0.05),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          switch (themeProvider.themeMode) {
            ThemeMode.system => Icons.brightness_auto_outlined,
            ThemeMode.light => Icons.light_mode_outlined,
            ThemeMode.dark => Icons.dark_mode_outlined,
          },
          size: 16,
          color: isDark ? Colors.white54 : Colors.black45,
        ),
      ),
    );
  }

  Widget _buildTabBar(BuildContext context, bool isDark) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      child: TabBar(
        controller: _tabController,
        isScrollable: false,
        labelColor: isDark ? Colors.white : const Color(0xFF1A1A2E),
        unselectedLabelColor: isDark ? Colors.white38 : Colors.black26,
        labelStyle: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w500,
        ),
        indicatorColor: isDark ? Colors.white : const Color(0xFF1A1A2E),
        indicatorWeight: 2.5,
        indicatorSize: TabBarIndicatorSize.label,
        dividerHeight: 0,
        tabs: _tabLabels.map((label) => Tab(text: label)).toList(),
      ),
    );
  }
}
