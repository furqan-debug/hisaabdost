
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

  // Show native ad with enhanced error handling
  static async showNativeAd(options: {
    adId: string;
    containerId: string;
  }): Promise<void> {
    console.log(`🎯 showNativeAd called with:`, {
      adId: options.adId,
      containerId: options.containerId,
      isNative: typeof window !== 'undefined' && window.Capacitor?.isNativePlatform(),
      capacitorExists: typeof window !== 'undefined' && !!window.Capacitor,
      timestamp: new Date().toISOString()
    });

    try {
      if (!this.isInitialized) {
        console.log('AdMob not initialized, initializing now...');
        await this.initialize();
      }

      // Verify container exists before attempting ad load
      const container = document.getElementById(options.containerId);
      if (!container) {
        const error = `Container element with ID '${options.containerId}' not found in DOM`;
        console.error('❌ CONTAINER ERROR:', error);
        throw new Error(error);
      }

      console.log('✅ Container found:', {
        id: options.containerId,
        element: container,
        bounds: container.getBoundingClientRect()
      });

      // Check if we're on a native platform with enhanced detection
      const isNative = typeof window !== 'undefined' && 
                      window.Capacitor?.isNativePlatform && 
                      window.Capacitor.isNativePlatform();
      
      console.log('🔍 Platform detection:', {
        windowExists: typeof window !== 'undefined',
        capacitorExists: typeof window !== 'undefined' && !!window.Capacitor,
        isNativePlatform: isNative,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
      });

      if (isNative) {
        console.log(`🚀 Loading PRODUCTION native ad: ${options.adId}`);
        
        try {
          // For native ads, we need to use the banner approach positioned in container
          // This is the current available method until true native ad support is added
          await AdMob.showBanner({
            adId: options.adId,
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.TOP_CENTER,
          });
          
          console.log('✅ PRODUCTION ad loaded successfully');
          
          // Update container to show successful ad load
          container.innerHTML = `
            <div style="
              background: #f0f9ff; 
              border: 2px solid #0ea5e9; 
              padding: 12px; 
              text-align: center; 
              border-radius: 8px;
              color: #0369a1;
              font-size: 12px;
              font-weight: 500;
            ">
              ✅ Production Ad Loaded
            </div>
          `;
          container.classList.add('ad-loaded');
          
        } catch (adError) {
          console.error('❌ CRITICAL: Native ad load failed:', adError);
          console.error('Ad error details:', JSON.stringify(adError, null, 2));
          
          // Show specific error in container
          container.innerHTML = `
            <div style="
              background: #fef2f2; 
              border: 2px solid #ef4444; 
              padding: 12px; 
              text-align: center; 
              border-radius: 8px;
              color: #dc2626;
              font-size: 11px;
            ">
              ❌ Ad Load Failed: ${adError.message || 'Unknown error'}
            </div>
          `;
          container.classList.add('ad-error');
          
          throw adError;
        }
        
      } else {
        console.log('🌐 Web platform detected - showing realistic placeholder');
        // Enhanced web placeholder for testing
        container.innerHTML = `
          <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            border: 1px solid #ddd; 
            padding: 20px; 
            text-align: center; 
            border-radius: 12px;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          ">
            <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Web Preview</div>
            <div style="font-size: 11px; opacity: 0.8;">Native ads work on mobile devices</div>
          </div>
        `;
        container.classList.add('ad-loaded');
      }
    } catch (error) {
      console.error('❌ CRITICAL showNativeAd error:', error);
      console.error('Full error context:', {
        adId: options.adId,
        containerId: options.containerId,
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Show error in container if it exists
      const container = document.getElementById(options.containerId);
      if (container) {
        container.innerHTML = `
          <div style="
            background: #fef2f2; 
            border: 1px solid #f87171; 
            padding: 12px; 
            text-align: center; 
            border-radius: 8px;
            color: #dc2626;
            font-size: 12px;
          ">
            ❌ Ad Error: ${error.message}
          </div>
        `;
        container.classList.add('ad-error');
      }
      
      throw error;
    }
  }

  // Hide native ad
  static async hideNativeAd(): Promise<void> {
    try {
      const isNative = typeof window !== 'undefined' && 
                      window.Capacitor?.isNativePlatform && 
                      window.Capacitor.isNativePlatform();

      if (isNative) {
        await AdMob.hideBanner();
        console.log('✅ Production ad hidden successfully');
      } else {
        console.log('🌐 Web platform - clearing ad containers');
        // Clear any web placeholders
        const containers = document.querySelectorAll('[id^="native-ad-"]');
        containers.forEach(container => {
          container.innerHTML = '';
          container.classList.remove('ad-loaded', 'ad-error');
        });
      }
    } catch (error) {
      console.error('❌ Failed to hide native ad:', error);
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
