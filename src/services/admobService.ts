
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

  // Show native ad (proper implementation)
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

        // For now, use banner ads as the closest alternative since native ads 
        // aren't directly supported in the current plugin version
        await AdMob.showBanner({
          adId: options.adId,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
        });
        
        console.log('✅ Banner ad (native ad fallback) shown successfully');
      } else {
        console.log('🌐 Web platform detected - showing placeholder');
        // For web platform, show a placeholder
        const container = document.getElementById(options.containerId);
        if (container) {
          container.innerHTML = `
            <div style="
              background: #f0f0f0; 
              border: 1px solid #ddd; 
              padding: 20px; 
              text-align: center; 
              border-radius: 8px;
              color: #666;
            ">
              <p>Ad Placeholder (Web)</p>
              <small>Native ads only work on mobile devices</small>
            </div>
          `;
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
            padding: 10px; 
            text-align: center; 
            border-radius: 4px;
            color: #d32f2f;
            font-size: 12px;
          ">
            Ad failed to load
          </div>
        `;
      }
      
      throw error;
    }
  }

  // Hide native ad
  static async hideNativeAd(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        await AdMob.hideBanner();
        console.log('✅ Native ad (banner fallback) hidden successfully');
      } else {
        console.log('🌐 Web platform - clearing ad containers');
        // Clear any web placeholders
        const containers = document.querySelectorAll('[id^="native-ad-"]');
        containers.forEach(container => {
          container.innerHTML = '';
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
