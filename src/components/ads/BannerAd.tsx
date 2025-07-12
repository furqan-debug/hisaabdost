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

  // Banner ads are rendered natively by AdMob at the bottom of the screen
  // This component just controls when they show/hide
  if (isLoading) {
    console.log(`⏳ BannerAd loading: ${adId}`);
  }

  if (error) {
    console.error(`❌ BannerAd error for ${adId}:`, error);
  }

  // No visual component needed - AdMob handles the banner display
  return null;
};