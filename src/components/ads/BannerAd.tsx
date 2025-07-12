import { useEffect } from 'react';
import { useBannerAd } from '@/hooks/useBannerAd';
interface BannerAdProps {
  adId: string;
  visible?: boolean;
}
export const BannerAd = ({
  adId,
  visible = true
}: BannerAdProps) => {
  const {
    isLoading,
    error,
    showBannerAd,
    hideBannerAd
  } = useBannerAd({
    adId,
    autoShow: false
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

  // Return a sticky container that positions the ad at the top
  return <div className="sticky top-[3.5rem] z-40 w-full bg-background/95 backdrop-blur-sm border-b border-border/20">
      <div className="h-12 flex items-center justify-center bg-muted/30">
        <div className="text-xs text-muted-foreground my-0 py-0">Advertisement</div>
      </div>
    </div>;
};