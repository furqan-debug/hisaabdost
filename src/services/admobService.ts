
import { CapacitorAdMob, AdOptions, AdSize, AdPosition } from 'capacitor-admob';

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
        await CapacitorAdMob.initialize({
          requestTrackingAuthorization: true,
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
    position?: string;
    size?: string;
  }): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const bannerOptions: AdOptions = {
        adId: options?.adId || 'ca-app-pub-3940256099942544/6300978111', // Test banner ad unit ID
        adSize: options?.size || 'BANNER',
        position: options?.position || 'BOTTOM_CENTER',
        margin: 0,
        isTesting: true, // Set to false in production
      };

      await CapacitorAdMob.showBanner(bannerOptions);
      console.log('Banner ad shown successfully');
    } catch (error) {
      console.error('Failed to show banner ad:', error);
      throw error;
    }
  }

  // Hide banner ad
  static async hideBannerAd(): Promise<void> {
    try {
      await CapacitorAdMob.hideBanner();
      console.log('Banner ad hidden successfully');
    } catch (error) {
      console.error('Failed to hide banner ad:', error);
      throw error;
    }
  }

  // Resume banner ad
  static async resumeBannerAd(): Promise<void> {
    try {
      await CapacitorAdMob.resumeBanner();
      console.log('Banner ad resumed successfully');
    } catch (error) {
      console.error('Failed to resume banner ad:', error);
      throw error;
    }
  }

  // Remove banner ad
  static async removeBannerAd(): Promise<void> {
    try {
      await CapacitorAdMob.removeBanner();
      console.log('Banner ad removed successfully');
    } catch (error) {
      console.error('Failed to remove banner ad:', error);
      throw error;
    }
  }
}
