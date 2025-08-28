import { AdMob, AdOptions } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

export interface AppOpenAdConfig {
  adUnitId: string;
  testingDevices?: string[];
  showFrequencyHours?: number;
}

export class AppOpenAdService {
  private static instance: AppOpenAdService;
  private config: AppOpenAdConfig;
  private isAdLoaded = false;
  private isAdShowing = false;
  private lastAdShownTime = 0;
  private readonly STORAGE_KEY = 'app_open_ad_last_shown';

  private constructor(config: AppOpenAdConfig) {
    this.config = {
      showFrequencyHours: 4, // Default to 4 hours
      ...config
    };
  }

  static getInstance(config?: AppOpenAdConfig): AppOpenAdService {
    if (!AppOpenAdService.instance && config) {
      AppOpenAdService.instance = new AppOpenAdService(config);
    }
    return AppOpenAdService.instance;
  }

  async initialize(): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('🔴 App Open ads only work on native platforms');
        return;
      }

      console.log('🚀 Initializing App Open ads...');
      
      await AdMob.initialize({
        testingDevices: this.config.testingDevices || [],
      });

      // Load the last shown time from storage
      this.loadLastShownTime();

      console.log('✅ App Open ads initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize App Open ads:', error);
    }
  }

  async loadAd(): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return;
      }

      if (this.isAdLoaded || this.isAdShowing) {
        console.log('📱 App Open ad already loaded or showing');
        return;
      }

      console.log('📥 Loading App Open ad...');

      // Use interstitial ad as fallback for app open ads
      await AdMob.prepareInterstitial({
        adId: this.config.adUnitId,
      });

      this.isAdLoaded = true;
      console.log('✅ App Open ad loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load App Open ad:', error);
      this.isAdLoaded = false;
    }
  }

  async showAd(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('🔴 App Open ads only work on native platforms');
        return false;
      }

      if (!this.canShowAd()) {
        console.log('⏰ App Open ad cannot be shown yet (frequency limit)');
        return false;
      }

      if (!this.isAdLoaded) {
        console.log('📱 App Open ad not loaded yet');
        await this.loadAd();
        return false;
      }

      if (this.isAdShowing) {
        console.log('📱 App Open ad already showing');
        return false;
      }

      console.log('📺 Showing App Open ad...');
      this.isAdShowing = true;

      // Use interstitial ad as fallback for app open ads
      await AdMob.showInterstitial();
      
      // Update last shown time
      this.lastAdShownTime = Date.now();
      this.saveLastShownTime();
      
      // Reset states
      this.isAdLoaded = false;
      this.isAdShowing = false;

      // Preload next ad
      setTimeout(() => this.loadAd(), 1000);

      console.log('✅ App Open ad shown successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to show App Open ad:', error);
      this.isAdShowing = false;
      this.isAdLoaded = false;
      return false;
    }
  }

  private canShowAd(): boolean {
    const now = Date.now();
    const timeSinceLastAd = now - this.lastAdShownTime;
    const frequencyMs = (this.config.showFrequencyHours || 4) * 60 * 60 * 1000;
    
    return timeSinceLastAd >= frequencyMs;
  }

  private loadLastShownTime(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.lastAdShownTime = parseInt(stored, 10);
      }
    } catch (error) {
      console.error('Failed to load last shown time:', error);
    }
  }

  private saveLastShownTime(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, this.lastAdShownTime.toString());
    } catch (error) {
      console.error('Failed to save last shown time:', error);
    }
  }

  getStatus(): {
    isLoaded: boolean;
    isShowing: boolean;
    canShow: boolean;
    nextAvailableTime: number;
  } {
    return {
      isLoaded: this.isAdLoaded,
      isShowing: this.isAdShowing,
      canShow: this.canShowAd(),
      nextAvailableTime: this.lastAdShownTime + ((this.config.showFrequencyHours || 4) * 60 * 60 * 1000)
    };
  }
}