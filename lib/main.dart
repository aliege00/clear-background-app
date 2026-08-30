import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'app.dart';
import 'services/background_removal_service.dart';
import 'services/ad_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait on phones
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  final bgService = BackgroundRemovalService();
  await bgService.loadModel();

  final adService = AdService();
  await adService.initialize();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: bgService),
        ChangeNotifierProvider.value(value: adService),
      ],
      child: const ArkaPlanApp(),
    ),
  );
}
