
import { AdMob } from '@capacitor-community/admob';

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

  // Show native ad
  static async showNativeAd(options: {
    adId: string;
    containerId: string;
  }): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Only show ads on native platform
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        await AdMob.showNativeAd({
          adId: options.adId,
          // The plugin will handle positioning the ad in the native view
        });
        console.log('Native ad shown successfully');
      } else {
        console.log('Native ad skipped - not on native platform');
      }
    } catch (error) {
      console.error('Failed to show native ad:', error);
      throw error;
    }
  }

  // Hide native ad
  static async hideNativeAd(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        await AdMob.hideNativeAd();
        console.log('Native ad hidden successfully');
      }
    } catch (error) {
      console.error('Failed to hide native ad:', error);
    }
  }
}
