
import { useState, useEffect } from 'react';
import { AdMobService } from '@/services/admobService';

interface UseAdMobOptions {
  adId?: string;
  position?: string;
  size?: string;
  autoShow?: boolean;
}

export const useAdMob = (options: UseAdMobOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showBanner = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await AdMobService.showBannerAd({
        adId: options.adId,
        position: options.position,
        size: options.size,
      });
      
      setIsVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to show ad');
      console.error('Error showing banner ad:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const hideBanner = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await AdMobService.hideBannerAd();
      setIsVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to hide ad');
      console.error('Error hiding banner ad:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeBanner = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await AdMobService.removeBannerAd();
      setIsVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove ad');
      console.error('Error removing banner ad:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-show banner on mount if enabled
  useEffect(() => {
    if (options.autoShow) {
      showBanner();
    }

    // Cleanup on unmount
    return () => {
      if (isVisible) {
        removeBanner();
      }
    };
  }, [options.autoShow]);

  return {
    showBanner,
    hideBanner,
    removeBanner,
    isLoading,
    isVisible,
    error,
  };
};
