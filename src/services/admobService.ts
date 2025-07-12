
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
        console.log('Initializing AdMob on native platform...');
        
        await AdMob.initialize({
          testingDevices: ['YOUR_DEVICE_ID'], // Add your test device ID
          initializeForTesting: true, // Set to true during development
        });
        
        this.isInitialized = true;
        console.log('✅ AdMob initialized successfully on native platform');
      } else {
        console.log('AdMob initialization skipped - not on native platform');
        // For web testing, we'll simulate initialization
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('❌ Failed to initialize AdMob:', error);
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
        console.log('AdMob not initialized, initializing now...');
        await this.initialize();
      }

      console.log(`Attempting to show native ad: ${options.adId} in container: ${options.containerId}`);

      // Check if we're on a native platform
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        // Verify container exists
        const container = document.getElementById(options.containerId);
        if (!container) {
          throw new Error(`Container element with ID '${options.containerId}' not found`);
        }

        console.log('Container found:', container);

        try {
          // Try to use native ad first (if available in future plugin versions)
          // For now, we'll use banner ads positioned in the container
          await AdMob.showBanner({
            adId: options.adId,
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.TOP_CENTER,
          });
          
          console.log('✅ Ad shown successfully');
          
          // Clear loading state and add success indicator
          container.innerHTML = `
            <div style="
              background: #f8f9fa; 
              border: 1px solid #e9ecef; 
              padding: 8px; 
              text-align: center; 
              border-radius: 8px;
              color: #6c757d;
              font-size: 11px;
            ">
              Ad Loaded Successfully
            </div>
          `;
          container.classList.add('ad-loaded');
          
        } catch (adError) {
          console.error('❌ Failed to show ad:', adError);
          throw adError;
        }
        
      } else {
        console.log('🌐 Web platform detected - showing enhanced placeholder');
        // For web platform, show a more realistic placeholder
        const container = document.getElementById(options.containerId);
        if (container) {
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
              <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Sample Ad Content</div>
              <div style="font-size: 11px; opacity: 0.8;">Native ads work on mobile devices</div>
            </div>
          `;
          container.classList.add('ad-loaded');
        }
      }
    } catch (error) {
      console.error('❌ Failed to show native ad:', error);
      
      // Show error in container
      const container = document.getElementById(options.containerId);
      if (container) {
        container.innerHTML = `
          <div style="
            background: #ffebee; 
            border: 1px solid #f44336; 
            padding: 12px; 
            text-align: center; 
            border-radius: 8px;
            color: #d32f2f;
            font-size: 12px;
          ">
            Failed to load ad
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
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        await AdMob.hideBanner();
        console.log('✅ Ad hidden successfully');
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

  // Test with Google's sample ad ID
  static async testNativeAd(containerId: string): Promise<void> {
    const testAdId = 'ca-app-pub-3940256099942544/2247696110'; // Google's test native ad ID
    console.log('🧪 Testing with Google sample native ad ID');
    
    try {
      await this.showNativeAd({
        adId: testAdId,
        containerId: containerId,
      });
      console.log('✅ Test ad loaded successfully');
    } catch (error) {
      console.error('❌ Test ad failed:', error);
    }
  }

  // Show banner ad (legacy method)
  static async showBannerAd(options: {
    adId: string;
    containerId?: string;
  }): Promise<void> {
    return this.showNativeAd({ 
      adId: options.adId, 
      containerId: options.containerId || 'banner-container' 
    });
  }

  // Hide banner ad (legacy method)
  static async hideBannerAd(): Promise<void> {
    return this.hideNativeAd();
  }

  // Show interstitial ad
  static async showInterstitialAd(adId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        console.log('Preparing interstitial ad...');
        await AdMob.prepareInterstitial({
          adId: adId,
        });
        
        await AdMob.showInterstitial();
        console.log('✅ Interstitial ad shown successfully');
      } else {
        console.log('🌐 Interstitial ad skipped - web platform');
      }
    } catch (error) {
      console.error('❌ Failed to show interstitial ad:', error);
    }
  }
}
