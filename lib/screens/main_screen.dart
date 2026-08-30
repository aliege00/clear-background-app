import 'package:flutter/material.dart';
import 'background_removal_screen.dart';
import 'help_center_screen.dart';
import 'settings_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  static const _tabs = [
    _TabData(
      label: 'Arka Plan',
      icon: Icons.auto_fix_high_rounded,
      screen: BackgroundRemovalScreen(),
    ),
    _TabData(
      label: 'Yardım',
      icon: Icons.help_outline_rounded,
      screen: HelpCenterScreen(),
    ),
    _TabData(
      label: 'Ayarlar',
      icon: Icons.settings_rounded,
      screen: SettingsScreen(),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // ── Top App Bar ──
            _buildTopBar(context, isDark),

            // ── Tab Content ──
            Expanded(
              child: IndexedStack(
                index: _currentIndex,
                children: _tabs.map((t) => t.screen).toList(),
              ),
            ),
          ],
        ),
      ),

      // ── Bottom Tab Bar ──
      bottomNavigationBar: _buildBottomBar(context, isDark),
    );
  }

  Widget _buildTopBar(BuildContext context, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: isDark ? Colors.white : const Color(0xFF1A1A2E),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              Icons.auto_fix_high_rounded,
              size: 16,
              color: isDark ? const Color(0xFF0F0F14) : Colors.white,
            ),
          ),
          const SizedBox(width: 10),
          Text(
            'Arka Plan',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context, bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1A1A22) : Colors.white,
        border: Border(
          top: BorderSide(
            color: isDark
                ? Colors.white.withOpacity(0.06)
                : Colors.black.withOpacity(0.06),
          ),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(_tabs.length, (i) {
              final tab = _tabs[i];
              final isSelected = _currentIndex == i;
              return GestureDetector(
                onTap: () => setState(() => _currentIndex = i),
                behavior: HitTestBehavior.opaque,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? (isDark
                            ? Colors.white.withOpacity(0.1)
                            : const Color(0xFF1A1A2E).withOpacity(0.08))
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        tab.icon,
                        size: 18,
                        color: isSelected
                            ? (isDark ? Colors.white : const Color(0xFF1A1A2E))
                            : (isDark
                                ? Colors.white54
                                : Colors.black38),
                      ),
                      if (isSelected) ...[
                        const SizedBox(width: 6),
                        Text(
                          tab.label,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? Colors.white
                                : const Color(0xFF1A1A2E),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _TabData {
  final String label;
  final IconData icon;
  final Widget screen;

  const _TabData({
    required this.label,
    required this.icon,
    required this.screen,
  });
}
