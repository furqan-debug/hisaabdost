import { useCallback, useEffect, useState } from 'react';
import { AdMobService } from '@/services/admobService';

interface UseBannerAdOptions {
  adId: string;
  autoShow?: boolean;
}

export const useBannerAd = (options: UseBannerAdOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showBannerAd = useCallback(async () => {
    console.log(`🚀 useBannerAd: Starting banner ad load for ${options.adId}`);
    
    if (isVisible) {
      console.log('Banner ad already visible, skipping');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await AdMobService.showBannerAd(options.adId);
      setIsVisible(true);
      console.log(`✅ Banner ad shown successfully: ${options.adId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to show banner ad';
      setError(errorMessage);
      console.error(`❌ useBannerAd ERROR for ${options.adId}:`, {
        error: errorMessage,
        originalError: err,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, [options.adId, isVisible]);

  const hideBannerAd = useCallback(async () => {
    console.log(`🙈 useBannerAd: Hiding banner ad for ${options.adId}`);
    
    try {
      await AdMobService.hideBannerAd();
      setIsVisible(false);
      console.log(`✅ Banner ad hidden successfully: ${options.adId}`);
    } catch (err) {
      console.error(`❌ Error hiding banner ad for ${options.adId}:`, err);
    }
  }, [options.adId]);

  // Auto-show banner ad on mount if enabled
  useEffect(() => {
    if (options.autoShow !== false) {
      showBannerAd();
    }
  }, [options.autoShow, showBannerAd]);

  return {
    isLoading,
    error,
    isVisible,
    showBannerAd,
    hideBannerAd,
  };
};