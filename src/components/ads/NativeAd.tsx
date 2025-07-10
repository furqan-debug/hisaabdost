
import React, { useEffect } from 'react';
import { useNativeAd } from '@/hooks/useNativeAd';

interface NativeAdProps {
  adId: string;
  className?: string;
}

export const NativeAd = ({ adId, className = '' }: NativeAdProps) => {
  const containerId = `native-ad-${adId.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  const { isLoading, error, showNativeAd, hideNativeAd } = useNativeAd({
    adId,
    containerId,
    autoShow: false, // We'll handle showing manually
  });

  useEffect(() => {
    // Show ad on mount
    showNativeAd();

    // Hide ad on unmount
    return () => {
      hideNativeAd();
    };
  }, [showNativeAd, hideNativeAd]);

  if (error) {
    console.error('Native ad error:', error);
    return null;
  }

  // Only show loading state on native platform
  if (typeof window !== 'undefined' && !window.Capacitor?.isNativePlatform()) {
    return null;
  }

  return (
    <div className={`my-4 ${className}`}>
      {isLoading && (
        <div className="bg-muted/20 border border-border rounded-lg p-4 text-center animate-pulse">
          <p className="text-sm text-muted-foreground">Loading ad...</p>
        </div>
      )}
      <div id={containerId} />
    </div>
  );
};
