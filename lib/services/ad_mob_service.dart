import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

/// ─────────────────────────────────────────────────────────────
/// AdMobService
///
/// • Android / iOS  →  Gerçek Google TEST Ad Unit ID'leriyle çalışır.
/// • Windows         →  Hiçbir SDK çağrısı yapılmaz, toggle pasif.
///
/// Gerçek ID kullanmak istendiğinde BU SINIF İÇİNDEKİ sabitleri
/// değiştirmeniz yeterli — reklam kodunun geri kalanına dokunmaya
/// gerek kalmaz.
/// ─────────────────────────────────────────────────────────────
class AdMobService extends ChangeNotifier {
  // ── TEST Ad Unit IDs (Google Resmi Test ID'leri) ──────────
  // Gerçek ID kullanmak isterseniz SADECE bu değerleri değiştirin.

  static const String _testAppId = Platform.isAndroid
      ? 'ca-app-pub-3940256099942544~3347511713'   // Android TEST
      : 'ca-app-pub-3940256099942544~1458002511';   // iOS TEST

  static const String _testInterstitialAdUnitId = Platform.isAndroid
      ? 'ca-app-pub-3940256099942544/1033173712'   // Android TEST
      : 'ca-app-pub-3940256099942544/4411468910';   // iOS TEST

  // ── Durum ──────────────────────────────────────────────────
  InterstitialAd? _interstitialAd;
  bool _isInitialized = false;
  bool _hasShownAdThisSession = false;
  bool _adsEnabled = false; // Developer menüsünden açılır

  bool get isInitialized => _isInitialized;
  bool get hasShownAdThisSession => _hasShownAdThisSession;
  bool get adsEnabled => _adsEnabled;

  /// Windows masaüstünde reklam desteklenmez.
  static bool get isAdPlatform =>
      Platform.isAndroid || Platform.isIOS;

  /// Uygulama başlangıcında bir kez çağrılır.
  Future<void> initialize() async {
    if (!isAdPlatform) {
      _isInitialized = true;
      return;
    }

    try {
      await MobileAds.instance.initialize();
      _isInitialized = true;
      await _loadInterstitial();
    } catch (e) {
      debugPrint('[AdMobService] Başlatma hatası: $e');
    }
  }

  /// Interstitial reklamı yükler (sıradaki gösterim için hazır olur).
  Future<void> _loadInterstitial() async {
    if (!isAdPlatform || !_isInitialized) return;

    await InterstitialAd.load(
      adUnitId: _testInterstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          _attachFullScreenCallback(ad);
          notifyListeners();
        },
        onAdFailedToLoad: (error) {
          debugPrint('[AdMobService] Interstitial yükleme hatası: $error');
          _interstitialAd = null;
        },
      ),
    );
  }

  void _attachFullScreenCallback(InterstitialAd ad) {
    ad.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _interstitialAd = null;
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        debugPrint('[AdMobService] Gösterim hatası: $error');
        ad.dispose();
        _interstitialAd = null;
      },
    );
  }

  // ── Geliştirici Menüsü ─────────────────────────────────────

  /// Reklamları aç/kapat (sadece geliştirici menüsünden).
  void toggleAds(bool enabled) {
    if (!isAdPlatform) return;
    _adsEnabled = enabled;
    notifyListeners();
  }

  // ── Reklam Gösterim Mantığı ────────────────────────────────

  /// Sayfa 3'te bir ayar değiştirildiğinde çağrılır.
  /// Oturum başına maks. 1 kez reklam gösterir.
  void onSettingChanged() {
    if (!isAdPlatform) return;
    if (!_adsEnabled) return;
    if (_hasShownAdThisSession) return;
    if (_interstitialAd == null) return;

    _hasShownAdThisSession = true;
    _interstitialAd!.show();
    notifyListeners();
  }

  @override
  void dispose() {
    _interstitialAd?.dispose();
    super.dispose();
  }
}
