import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export class AdMobService {
  private static isInitialized = false;

  // Initialize AdMob for production
  static async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('AdMob already initialized');
        return;
      }

      // Check if we're on a native platform
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        console.log('🚀 Initializing AdMob on native platform for PRODUCTION...');
        
        await AdMob.initialize({
          initializeForTesting: false, // Production mode
          testingDevices: [], // No test devices for production
        });
        
        this.isInitialized = true;
        console.log('✅ AdMob initialized successfully for PRODUCTION');
      } else {
        console.log('🌐 Not on native platform - AdMob initialization skipped');
        // For web testing, we'll simulate initialization
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('❌ CRITICAL: Failed to initialize AdMob:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  // Show banner ad
  static async showBannerAd(adId: string): Promise<void> {
    console.log(`🎯 showBannerAd called with adId: ${adId}`);

    try {
      if (!this.isInitialized) {
        console.log('AdMob not initialized, initializing now...');
        await this.initialize();
      }

      const isNative = typeof window !== 'undefined' && 
                      window.Capacitor?.isNativePlatform && 
                      window.Capacitor.isNativePlatform();
      
      console.log('🔍 Platform detection for banner:', {
        isNative,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
      });

      if (isNative) {
        console.log(`🚀 Loading PRODUCTION banner ad: ${adId}`);
        
        await AdMob.showBanner({
          adId: adId,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
        });
        
        console.log('✅ PRODUCTION banner ad loaded successfully');
      } else {
        console.log('🌐 Web platform detected - banner ad skipped for web');
      }
    } catch (error) {
      console.error('❌ Failed to show banner ad:', error);
      console.error('Banner error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  // Hide banner ad
  static async hideBannerAd(): Promise<void> {
    try {
      const isNative = typeof window !== 'undefined' && 
                      window.Capacitor?.isNativePlatform && 
                      window.Capacitor.isNativePlatform();

      if (isNative) {
        await AdMob.hideBanner();
        console.log('✅ Production banner ad hidden successfully');
      } else {
        console.log('🌐 Web platform - banner ad hide skipped');
      }
    } catch (error) {
      console.error('❌ Failed to hide banner ad:', error);
    }
  }

  // Show interstitial ad
  static async showInterstitialAd(adId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const isNative = typeof window !== 'undefined' && 
                      window.Capacitor?.isNativePlatform && 
                      window.Capacitor.isNativePlatform();

      if (isNative) {
        console.log('🚀 Loading PRODUCTION interstitial ad...');
        await AdMob.prepareInterstitial({
          adId: adId,
        });
        
        await AdMob.showInterstitial();
        console.log('✅ PRODUCTION interstitial ad shown successfully');
      } else {
        console.log('🌐 Interstitial ad skipped - web platform');
      }
    } catch (error) {
      console.error('❌ Failed to show interstitial ad:', error);
      console.error('Interstitial error details:', JSON.stringify(error, null, 2));
    }
  }
}