
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export class AdMobService {
  private static isInitialized = false;
  private static currentBannerAdId: string | null = null;
  private static initializationPromise: Promise<void> | null = null;

  // Initialize AdMob with better error handling
  static async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('✅ AdMob already initialized');
        return;
      }

      // Prevent multiple initialization attempts
      if (this.initializationPromise) {
        console.log('⏳ AdMob initialization in progress, waiting...');
        return this.initializationPromise;
      }

      // Check if we're on a native platform
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        console.log('🚀 Initializing AdMob on native platform for PRODUCTION...');
        
        this.initializationPromise = AdMob.initialize({
          initializeForTesting: false, // Production mode
          testingDevices: [], // No test devices for production
        });

        await this.initializationPromise;
        
        this.isInitialized = true;
        this.initializationPromise = null;
        console.log('✅ AdMob initialized successfully for PRODUCTION');
      } else {
        console.log('🌐 Not on native platform - AdMob initialization skipped');
        // For web testing, simulate initialization
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('❌ CRITICAL: Failed to initialize AdMob:', error);
      this.initializationPromise = null;
      
      // Don't throw in production, just log the error
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    }
  }

  // Show banner ad with improved error handling
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
          position: BannerAdPosition.TOP_CENTER,
        });
        
        this.currentBannerAdId = adId;
        console.log('✅ PRODUCTION banner ad loaded successfully');
      } else {
        console.log('🌐 Web platform detected - banner ad skipped for web');
        this.currentBannerAdId = adId;
      }
    } catch (error) {
      console.error('❌ Failed to show banner ad:', error);
      this.currentBannerAdId = null;
      
      // Don't throw in production to prevent app crashes
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    }
  }

  // Hide banner ad
  static async hideBannerAd(): Promise<void> {
    try {
      const isNative = typeof window !== 'undefined' && 
                      window.Capacitor?.isNativePlatform && 
                      window.Capacitor.isNativePlatform();

      if (isNative && this.currentBannerAdId) {
        await AdMob.hideBanner();
        console.log('✅ Production banner ad hidden successfully');
      } else {
        console.log('🌐 Web platform or no active banner - hide skipped');
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
      
      // Don't throw in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Interstitial error details:', JSON.stringify(error, null, 2));
      }
    }
  }

  // Get current banner status
  static getCurrentBannerAdId(): string | null {
    return this.currentBannerAdId;
  }

  // Reset initialization state (for debugging)
  static reset(): void {
    this.isInitialized = false;
    this.currentBannerAdId = null;
    this.initializationPromise = null;
    console.log('🔄 AdMob service reset');
  }
}
