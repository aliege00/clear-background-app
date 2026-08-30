import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

/// Manages ad lifecycle per the requirements:
/// - At most ONE ad per session (app open → close)
/// - Triggered only when a setting is changed on the Settings tab
/// - Uses Google's official TEST ad unit IDs
/// - No-op on Windows (AdMob unsupported there)
class AdService extends ChangeNotifier {
  InterstitialAd? _interstitialAd;
  bool _adShownThisSession = false;
  bool _adsEnabled = false;
  bool _isInitialized = false;
  bool _isWindows = false;

  bool get adsEnabled => _adsEnabled;
  bool get adShownThisSession => _adShownThisSession;
  bool get isWindows => _isWindows;
  bool get isSupportedPlatform => !_isWindows;

  /// Initialize the Mobile Ads SDK (Android/iOS only).
  Future<void> initialize() async {
    _isWindows = Platform.isWindows;
    if (_isWindows) {
      _isInitialized = true;
      return;
    }

    try {
      await MobileAds.instance.initialize();
      _isInitialized = true;
      await _preloadAd();
    } catch (e) {
      debugPrint('AdMob init failed: $e');
      _isInitialized = false;
    }
  }

  /// Pre-load the next interstitial ad.
  Future<void> _preloadAd() async {
    if (_isWindows || !_isInitialized) return;

    await InterstitialAd.load(
      // Google's official TEST ad unit ID for interstitial ads
      adUnitId: Platform.isAndroid
          ? 'ca-app-pub-3940256099942544/1033173712' // Android test ID
          : 'ca-app-pub-3940256099942544/4411468910', // iOS test ID
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          _setFullScreenCallback(ad);
          notifyListeners();
        },
        onAdFailedToLoad: (error) {
          debugPrint('Interstitial ad failed to load: $error');
          _interstitialAd = null;
        },
      ),
    );
  }

  void _setFullScreenCallback(InterstitialAd ad) {
    ad.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _interstitialAd = null;
        // Pre-load the next one for future sessions
        _preloadAd();
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        ad.dispose();
        _interstitialAd = null;
      },
    );
  }

  /// Toggle ads on/off (from developer menu).
  void toggleAds(bool enabled) {
    if (_isWindows) return; // No-op on Windows
    _adsEnabled = enabled;
    notifyListeners();
  }

  /// Show ad if: ads enabled, not shown this session, and on supported platform.
  /// Called when a setting is changed on the Settings tab.
  void onSettingChanged() {
    if (_isWindows) return;
    if (!_adsEnabled) return;
    if (_adShownThisSession) return;
    if (_interstitialAd == null) return;

    _adShownThisSession = true;
    _interstitialAd!.show();
    notifyListeners();
  }

  /// Reset the per-session flag (called at app startup).
  void resetSession() {
    _adShownThisSession = false;
  }

  @override
  void dispose() {
    _interstitialAd?.dispose();
    super.dispose();
  }
}
