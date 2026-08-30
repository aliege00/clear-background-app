import 'package:flutter/material.dart';

/// Tema yönetimi: Sistem / Aydınlık / Karanlık.
/// Seçim SharedPrefs yerine bellekte tutulur (stateless uygulama).
class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;

  ThemeMode get themeMode => _themeMode;

  String get themeLabel {
    switch (_themeMode) {
      case ThemeMode.light:
        return 'Aydınlık';
      case ThemeMode.dark:
        return 'Karanlık';
      case ThemeMode.system:
        return 'Sistem';
    }
  }

  void setThemeMode(ThemeMode mode) {
    if (_themeMode == mode) return;
    _themeMode = mode;
    notifyListeners();
  }
}
