import { useState, useEffect } from 'react';
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

  const showNativeAd = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await AdMobService.showNativeAd({
        adId: options.adId,
        containerId: options.containerId,
      });
      
      setIsVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to show native ad');
      console.error('Error showing native ad:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-show native ad on mount if enabled
  useEffect(() => {
    if (options.autoShow) {
      showNativeAd();
    }
  }, [options.autoShow, options.adId]);

  return {
    showNativeAd,
    isLoading,
    isVisible,
    error,
  };
};