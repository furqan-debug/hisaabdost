import { useEffect, useRef } from 'react';
import { useBannerAd } from '@/hooks/useBannerAd';
interface BannerAdProps {
  adId: string;
  visible?: boolean;
}
export const BannerAd = ({
  adId,
  visible = true
}: BannerAdProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  console.log(`🎯 BannerAd: Component rendered with adId: ${adId}, visible: ${visible}`);
  const {
    isLoading,
    error,
    showBannerAd,
    hideBannerAd
  } = useBannerAd({
    adId,
    autoShow: false // We'll manually control when to show
  });
  useEffect(() => {
    console.log(`📱 BannerAd: Effect triggered - visible: ${visible}, isLoading: ${isLoading}, error: ${error}`);
    if (visible && !isLoading && !error) {
      console.log(`📱 BannerAd: Attempting to show banner for ${adId}`);
      showBannerAd().catch(err => {
        console.error(`❌ BannerAd: Failed to show banner ${adId}:`, err);
      });
    } else if (!visible) {
      console.log(`📱 BannerAd: Hiding banner for ${adId}`);
      hideBannerAd().catch(err => {
        console.error(`❌ BannerAd: Failed to hide banner ${adId}:`, err);
      });
    }
  }, [visible, adId, showBannerAd, hideBannerAd, isLoading, error]);

  // Log current state for debugging
  useEffect(() => {
    console.log(`🔍 BannerAd State: ${adId}`, {
      visible,
      isLoading,
      error,
      containerExists: !!containerRef.current,
      timestamp: new Date().toISOString()
    });
  }, [visible, isLoading, error, adId]);
  if (error) {
    console.error(`❌ BannerAd error for ${adId}:`, error);
    // Show a fallback placeholder when there's an error
    return <div ref={containerRef} id="banner-ad-container" className="fixed left-0 right-0 z-40 w-full h-12 bg-muted/10 border-b border-border/20 flex items-center justify-center" style={{
      top: 'calc(3.5rem + env(safe-area-inset-top))'
    }}>
        <div className="text-xs text-muted-foreground">Ad unavailable</div>
      </div>;
  }

  // The actual AdMob banner will be rendered natively by Capacitor
  // This div serves as a placeholder/spacer for the native ad
  return;
};