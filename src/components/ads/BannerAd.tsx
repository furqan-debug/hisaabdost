
import { useEffect } from 'react';
import { useBannerAd } from '@/hooks/useBannerAd';

interface BannerAdProps {
  adId: string;
  visible?: boolean;
}

export const BannerAd = ({ adId, visible = true }: BannerAdProps) => {
  console.log(`🎯 BannerAd: Component rendered with adId: ${adId}, visible: ${visible}`);
  
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

  // The actual AdMob banner will be rendered natively by Capacitor
  // This div serves as a placeholder/spacer for the native ad
  return (
    <div 
      id="banner-ad-container" 
      className="fixed top-14 left-0 right-0 z-40 w-full h-12 bg-transparent"
      style={{ top: 'calc(3.5rem + env(safe-area-inset-top))' }}
    >
      {/* Native AdMob banner will be positioned here */}
    </div>
  );
};
