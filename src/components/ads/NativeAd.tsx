
import React, { useEffect, useRef, useState } from 'react';
import { useNativeAd } from '@/hooks/useNativeAd';

interface NativeAdProps {
  adId: string;
  className?: string;
  testMode?: boolean; // Allow testing with Google's sample ad
}

export const NativeAd = ({ adId, className = '', testMode = false }: NativeAdProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerError, setContainerError] = useState<string | null>(null);
  
  // Generate a unique container ID
  const containerId = `native-ad-${adId.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;
  
  const actualAdId = testMode ? 'ca-app-pub-3940256099942544/2247696110' : adId;
  
  const { isLoading, error, showNativeAd, hideNativeAd } = useNativeAd({
    adId: actualAdId,
    containerId,
    autoShow: false,
  });

  useEffect(() => {
    console.log(`NativeAd component mounted with ID: ${containerId}`);
    
    // Verify container exists before showing ad
    const checkContainer = () => {
      if (containerRef.current) {
        console.log(`Container ${containerId} found, showing ad...`);
        showNativeAd();
        setContainerError(null);
      } else {
        const errorMsg = `Container ${containerId} not found`;
        console.error(errorMsg);
        setContainerError(errorMsg);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(checkContainer, 100);

    return () => {
      clearTimeout(timer);
      console.log(`Hiding ad for container: ${containerId}`);
      hideNativeAd();
    };
  }, [showNativeAd, hideNativeAd, containerId]);

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error(`Native ad error for ${containerId}:`, error);
    }
  }, [error, containerId]);

  // Always render a container div for the ad
  return (
    <div className={`native-ad-wrapper my-4 ${className}`}>
      {testMode && (
        <div className="mb-2 text-xs text-muted-foreground text-center">
          🧪 Test Mode - Using Google Sample Ad
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="bg-muted/20 border border-border rounded-lg p-4 text-center animate-pulse">
          <p className="text-sm text-muted-foreground">Loading ad...</p>
        </div>
      )}
      
      {/* Error states */}
      {(error || containerError) && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-center">
          <p className="text-xs text-destructive">
            Ad Error: {error || containerError}
          </p>
        </div>
      )}
      
      {/* The actual ad container - ALWAYS rendered */}
      <div 
        id={containerId} 
        ref={containerRef}
        className="native-ad-container min-h-[50px]"
        style={{ 
          position: 'relative',
          display: 'block',
          width: '100%'
        }}
      />
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-muted-foreground opacity-50">
          Container ID: {containerId} | Ad ID: {actualAdId}
        </div>
      )}
    </div>
  );
};
