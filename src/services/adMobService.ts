import { Platform } from 'react-native';
import mobileAds, {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const AD_UNIT_IDS = {
  interstitial: Platform.select({
    android: TestIds.INTERSTITIAL,
    ios: TestIds.INTERSTITIAL,
    default: TestIds.INTERSTITIAL,
  })!,
};

class AdMobServiceModule {
  private interstitial: InterstitialAd | null = null;
  private isInitialized = false;
  private hasShownAdThisSession = false;
  private adsEnabled = false;

  get getAdsEnabled(): boolean { return this.adsEnabled; }

  async initialize(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await mobileAds().initialize();
      this.isInitialized = true;
      await this.loadInterstitial();
    } catch (e) {
      console.warn('[AdMob] Init error:', e);
    }
  }

  private async loadInterstitial(): Promise<void> {
    if (!this.isInitialized) return;
    this.interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial);
    this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      this.interstitial = null;
      this.loadInterstitial();
    });
    this.interstitial.addAdEventListener(AdEventType.ERROR, () => {
      this.interstitial = null;
    });
    this.interstitial.load();
  }

  toggleAds(enabled: boolean): void {
    this.adsEnabled = enabled;
  }

  onSettingChanged(): void {
    if (Platform.OS === 'web') return;
    if (!this.adsEnabled || this.hasShownAdThisSession || !this.interstitial) return;
    this.hasShownAdThisSession = true;
    this.interstitial.show();
  }
}

export const adMobService = new AdMobServiceModule();
