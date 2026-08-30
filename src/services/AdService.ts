import { Platform } from 'react-native';
import mobileAds, {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// ─────────────────────────────────────────────────────────────
// AD SERVICE
//
// • Android / iOS → Google TEST Ad Unit ID'leri kullanılır
// • Windows       → Hiçbir SDK çağrısı yapılmaz
//
// Gerçek ID kullanmak istendiğinde SADECE bu dosyadaki
// _interstitialAdUnitId değerini değiştirin.
// ─────────────────────────────────────────────────────────────

const _interstitialAdUnitId = Platform.select({
  android: TestIds.INTERSTITIAL, // Google'ın resmi Android test ID'si
  ios: TestIds.INTERSTITIAL,     // Google'ın resmi iOS test ID'si
  default: '',                    // Windows/Desktop — boş
});

// Durum
let _interstitialAd: InterstitialAd | null = null;
let _hasShownAdThisSession = false;
let _adsEnabled = false;

/// Windows masaüstünde reklam desteklenmez.
export const isAdPlatform = Platform.OS === 'android' || Platform.OS === 'ios';

/// Uygulama açılışında bir kez çağrılır.
export async function initializeAds() {
  if (!isAdPlatform) return;

  try {
    await mobileAds().initialize();
    _loadInterstitial();
  } catch (e) {
    console.warn('[AdMob] Başlatma hatası:', e);
  }
}

/// Interstitial reklamı yükler.
function _loadInterstitial() {
  if (!isAdPlatform || !_interstitialAdUnitId) return;

  _interstitialAd = InterstitialAd.createForAdRequest(_interstitialAdUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  _interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    // Reklam yüklendi — hazır
  });

  _interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    _interstitialAd = null;
    _loadInterstitial(); // Bir sonraki için yükle
  });

  _interstitialAd.load();
}

// ── Geliştirici Menüsü ──

export function toggleAds(enabled: boolean) {
  if (!isAdPlatform) return;
  _adsEnabled = enabled;
}

export function getAdsEnabled() {
  return _adsEnabled;
}

/// Ayarlar sayfasında bir ayar değiştirildiğinde çağrılır.
/// Oturum başına maks. 1 kez reklam gösterir.
export function onSettingChanged() {
  if (!isAdPlatform) return;
  if (!_adsEnabled) return;
  if (_hasShownAdThisSession) return;
  if (!_interstitialAd) return;

  _hasShownAdThisSession = true;
  _interstitialAd.show();
}

/// Oturum durumunu sıfırla (test amaçlı).
export function resetSession() {
  _hasShownAdThisSession = false;
}

export function hasShownAdThisSession() {
  return _hasShownAdThisSession;
}
