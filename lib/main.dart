import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'app.dart';
import 'services/background_removal_service.dart';
import 'services/ad_mob_service.dart';
import 'services/theme_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Servisleri başlat
  final bgService = BackgroundRemovalService();
  await bgService.loadModel();

  final adService = AdMobService();
  await adService.initialize();

  final themeProvider = ThemeProvider();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: bgService),
        ChangeNotifierProvider.value(value: adService),
        ChangeNotifierProvider.value(value: themeProvider),
      ],
      child: const ArkaPlanApp(),
    ),
  );
}
