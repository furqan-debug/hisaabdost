
import { useState, useEffect, useCallback } from 'react';
import { AdMobService } from '@/services/admobService';

interface UseNativeAdOptions {
  adId: string;
  containerId: string;
  autoShow?: boolean;
}

export const useNativeAd = (options: UseNativeAdOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showNativeAd = useCallback(async () => {
    console.log(`🎯 useNativeAd: Attempting to show ad ${options.adId} in ${options.containerId}`);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Double check container exists
      const container = document.getElementById(options.containerId);
      if (!container) {
        throw new Error(`Container ${options.containerId} not found in DOM`);
      }
      
      console.log(`📦 Container ${options.containerId} confirmed in DOM`);
      
      await AdMobService.showNativeAd({
        adId: options.adId,
        containerId: options.containerId,
      });
      
      setIsVisible(true);
      console.log(`✅ Ad ${options.adId} shown successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to show native ad';
      setError(errorMessage);
      console.error(`❌ useNativeAd error for ${options.containerId}:`, err);
      
      // Log additional debugging info
      console.log(`🔍 Debug info:`, {
        containerId: options.containerId,
        adId: options.adId,
        containerExists: !!document.getElementById(options.containerId),
        isNativePlatform: typeof window !== 'undefined' && window.Capacitor?.isNativePlatform(),
        capacitorAvailable: typeof window !== 'undefined' && !!window.Capacitor,
      });
    } finally {
      setIsLoading(false);
    }
  }, [options.adId, options.containerId]);

  const hideNativeAd = useCallback(async () => {
    console.log(`🙈 useNativeAd: Hiding ad for ${options.containerId}`);
    
    try {
      await AdMobService.hideNativeAd();
      setIsVisible(false);
      console.log(`✅ Ad hidden for ${options.containerId}`);
    } catch (err) {
      console.error(`❌ Error hiding native ad for ${options.containerId}:`, err);
    }
  }, [options.containerId]);

  // Auto-show native ad on mount if enabled
  useEffect(() => {
    if (options.autoShow) {
      console.log(`🚀 Auto-showing ad for ${options.containerId}`);
      showNativeAd();
    }
  }, [options.autoShow, showNativeAd]);

  return {
    showNativeAd,
    hideNativeAd,
    isLoading,
    isVisible,
    error,
  };
};
