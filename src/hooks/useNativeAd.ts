
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
    console.log(`🚀 useNativeAd: Starting ad load process`, {
      adId: options.adId,
      containerId: options.containerId,
      timestamp: new Date().toISOString()
    });
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Enhanced container verification
      const container = document.getElementById(options.containerId);
      if (!container) {
        const error = `Container ${options.containerId} not found in DOM`;
        console.error(`❌ CONTAINER ERROR:`, error);
        throw new Error(error);
      }
      
      console.log(`✅ Container verified:`, {
        containerId: options.containerId,
        bounds: container.getBoundingClientRect(),
        visible: container.offsetParent !== null,
        classes: container.className
      });
      
      // Enhanced platform detection logging
      const platformInfo = {
        windowExists: typeof window !== 'undefined',
        capacitorExists: typeof window !== 'undefined' && !!window.Capacitor,
        isNativePlatform: typeof window !== 'undefined' && 
                         window.Capacitor?.isNativePlatform && 
                         window.Capacitor.isNativePlatform(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
      };
      
      console.log(`🔍 Platform detection:`, platformInfo);
      
      await AdMobService.showNativeAd({
        adId: options.adId,
        containerId: options.containerId,
      });
      
      setIsVisible(true);
      console.log(`✅ Ad shown successfully for ${options.containerId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to show native ad';
      setError(errorMessage);
      console.error(`❌ useNativeAd CRITICAL ERROR:`, {
        containerId: options.containerId,
        adId: options.adId,
        error: err,
        errorMessage,
        errorStack: err instanceof Error ? err.stack : undefined,
        containerExists: !!document.getElementById(options.containerId),
        timestamp: new Date().toISOString()
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
      console.log(`✅ Ad hidden successfully for ${options.containerId}`);
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
