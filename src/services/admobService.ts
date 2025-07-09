
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

      // For now, we'll create a placeholder since native ads aren't directly supported
      // In a real implementation, you'd use the native ad API when available
      const container = document.getElementById(options.containerId);
      if (container && typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()) {
        // Create a native ad placeholder
        container.innerHTML = `
          <div class="bg-muted/20 border border-border rounded-lg p-4 text-center">
            <p class="text-sm text-muted-foreground">Native Ad (${options.adId})</p>
          </div>
        `;
        console.log('Native ad shown successfully');
      }
    } catch (error) {
      console.error('Failed to show native ad:', error);
      throw error;
    }
  }
}
