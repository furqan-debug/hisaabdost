
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export class AdMobService {
  private static isInitialized = false;
  private static currentBannerAdId: string | null = null;

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

      // Hide any existing banner first
      if (this.currentBannerAdId && this.currentBannerAdId !== adId) {
        console.log(`🔄 Hiding existing banner: ${this.currentBannerAdId}`);
        await this.hideBannerAd();
      }

      const isNative = typeof window !== 'undefined' && 
                      window.Capacitor?.isNativePlatform && 
                      window.Capacitor.isNativePlatform();
      
      console.log('🔍 Platform detection for banner:', {
        isNative,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        adId
      });

      if (isNative) {
        console.log(`🚀 Loading PRODUCTION banner ad: ${adId}`);
        
        await AdMob.showBanner({
          adId: adId,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.TOP_CENTER, // Changed to TOP_CENTER for sticky header
        });
        
        this.currentBannerAdId = adId;
        console.log('✅ PRODUCTION banner ad loaded successfully');
      } else {
        console.log('🌐 Web platform detected - banner ad skipped for web');
        // For web testing, we can simulate a successful load
        this.currentBannerAdId = adId;
      }
    } catch (error) {
      console.error('❌ Failed to show banner ad:', error);
      console.error('Banner error details:', JSON.stringify(error, null, 2));
      
      // Reset current banner ID on error
      this.currentBannerAdId = null;
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
      
      this.currentBannerAdId = null;
    } catch (error) {
      console.error('❌ Failed to hide banner ad:', error);
      this.currentBannerAdId = null;
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

  // Get current banner status
  static getCurrentBannerAdId(): string | null {
    return this.currentBannerAdId;
  }
}
