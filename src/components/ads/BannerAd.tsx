import { useEffect } from 'react';
import { useBannerAd } from '@/hooks/useBannerAd';

interface BannerAdProps {
  adId: string;
  visible?: boolean;
}

export const BannerAd = ({ adId, visible = true }: BannerAdProps) => {
  const { isLoading, error, showBannerAd, hideBannerAd } = useBannerAd({
    adId,
    autoShow: false, // We'll manually control when to show
  });

  useEffect(() => {
    if (visible) {
      console.log(`📱 BannerAd: Showing banner for ${adId}`);
      showBannerAd();
    } else {
      console.log(`📱 BannerAd: Hiding banner for ${adId}`);
      hideBannerAd();
    }
  }, [visible, adId, showBannerAd, hideBannerAd]);

  if (isLoading) {
    console.log(`⏳ BannerAd loading: ${adId}`);
  }

  if (error) {
    console.error(`❌ BannerAd error for ${adId}:`, error);
  }

  // Sticky banner positioned below header with visual placeholder
  return (
    <div className="sticky top-14 z-40 w-full h-12 bg-muted/20 border-b border-border/20 flex items-center justify-center">
      <div className="text-xs text-muted-foreground">
        {isLoading ? 'Loading ad...' : error ? 'Ad unavailable' : 'Advertisement'}
      </div>
    </div>
  );
};