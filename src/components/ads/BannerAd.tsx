
import { useEffect } from 'react';
import { useBannerAd } from '@/hooks/useBannerAd';

interface BannerAdProps {
  adId: string;
  visible?: boolean;
}

export const BannerAd = ({ adId, visible = true }: BannerAdProps) => {
  const { isLoading, error, showBannerAd, hideBannerAd } = useBannerAd({
    adId,
    autoShow: false,
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

  if (!visible) return null;

  // Position sticky right below the header bar (h-14 = 3.5rem)
  return (
    <div className="sticky top-14 z-40 w-full bg-background/95 backdrop-blur-sm border-b border-border/20">
      <div className="h-16 flex items-center justify-center bg-muted/30 mx-4 my-2 rounded-lg border border-dashed border-muted-foreground/30">
        <div className="text-sm text-muted-foreground font-medium">Advertisement</div>
      </div>
    </div>
  );
};
