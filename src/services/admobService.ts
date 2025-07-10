
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export class AdMobService {
  private static isInitialized = false;

  // Initialize AdMob
  static async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('AdMob already initialized');
        return;
      }

      // Check if we're on a native platform
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        await AdMob.initialize({
          testingDevices: ['YOUR_DEVICE_ID'], // Add your test device ID
          initializeForTesting: false, // Set to true during development
        });
        
        this.isInitialized = true;
        console.log('AdMob initialized successfully');
      } else {
        console.log('AdMob initialization skipped - not on native platform');
      }
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
      throw error;
    }
  }

  // Show banner ad (native ads aren't directly supported in this plugin version)
  static async showBannerAd(options: {
    adId: string;
    containerId?: string;
  }): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Only show ads on native platform
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        // Use banner ad as closest alternative to native ad
        await AdMob.showBanner({
          adId: options.adId,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
        });
        console.log('Banner ad shown successfully');
      } else {
        console.log('Banner ad skipped - not on native platform');
      }
    } catch (error) {
      console.error('Failed to show banner ad:', error);
      throw error;
    }
  }

  // Hide banner ad
  static async hideBannerAd(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        await AdMob.hideBanner();
        console.log('Banner ad hidden successfully');
      }
    } catch (error) {
      console.error('Failed to hide banner ad:', error);
    }
  }

  // Show interstitial ad (alternative approach)
  static async showInterstitialAd(adId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        await AdMob.prepareInterstitial({
          adId: adId,
        });
        
        await AdMob.showInterstitial();
        console.log('Interstitial ad shown successfully');
      }
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
    }
  }

  // Legacy method for backward compatibility
  static async showNativeAd(options: {
    adId: string;
    containerId: string;
  }): Promise<void> {
    // For now, use banner ad as fallback
    return this.showBannerAd(options);
  }

  // Legacy method for backward compatibility
  static async hideNativeAd(): Promise<void> {
    return this.hideBannerAd();
  }
}
