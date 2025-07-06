
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

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

  // Show banner ad
  static async showBannerAd(options?: {
    adId?: string;
    position?: BannerAdPosition;
    size?: BannerAdSize;
  }): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const bannerOptions: BannerAdOptions = {
        adId: options?.adId || 'ca-app-pub-3940256099942544/6300978111', // Test banner ad unit ID
        adSize: (options?.size as BannerAdSize) || BannerAdSize.BANNER,
        position: (options?.position as BannerAdPosition) || BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        // isTesting: true, // Set to false in production
      };

      await AdMob.showBanner(bannerOptions);
      console.log('Banner ad shown successfully');
    } catch (error) {
      console.error('Failed to show banner ad:', error);
      throw error;
    }
  }

  // Hide banner ad
  static async hideBannerAd(): Promise<void> {
    try {
      await AdMob.hideBanner();
      console.log('Banner ad hidden successfully');
    } catch (error) {
      console.error('Failed to hide banner ad:', error);
      throw error;
    }
  }

  // Resume banner ad
  static async resumeBannerAd(): Promise<void> {
    try {
      await AdMob.resumeBanner();
      console.log('Banner ad resumed successfully');
    } catch (error) {
      console.error('Failed to resume banner ad:', error);
      throw error;
    }
  }

  // Remove banner ad
  static async removeBannerAd(): Promise<void> {
    try {
      await AdMob.removeBanner();
      console.log('Banner ad removed successfully');
    } catch (error) {
      console.error('Failed to remove banner ad:', error);
      throw error;
    }
  }
}
