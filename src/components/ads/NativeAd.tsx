
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNativeAd } from '@/hooks/useNativeAd';

interface NativeAdProps {
  adId: string;
  className?: string;
  testMode?: boolean;
}

export const NativeAd = ({ adId, className = '', testMode = false }: NativeAdProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerError, setContainerError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Generate a truly stable container ID per component mount (no timestamp, no random values)
  const containerId = useMemo(() => {
    const cleanAdId = adId.replace(/[^a-zA-Z0-9]/g, '-');
    return `native-ad-${cleanAdId}`;
  }, [adId]);
  
  // Use production ad ID unless explicitly in test mode
  const actualAdId = testMode ? 'ca-app-pub-3940256099942544/2247696110' : adId;
  
  const { isLoading, error, showNativeAd, hideNativeAd } = useNativeAd({
    adId: actualAdId,
    containerId,
    autoShow: false,
  });

  console.log(`🎯 NativeAd component render:`, {
    adId: actualAdId,
    containerId,
    testMode,
    mounted,
    isLoading,
    error: error || containerError,
    timestamp: new Date().toISOString()
  });

  // Set mounted state
  useEffect(() => {
    console.log(`🚀 NativeAd mounting with container ID: ${containerId}`);
    setMounted(true);
    return () => {
      console.log(`🔥 NativeAd unmounting: ${containerId}`);
      setMounted(false);
    };
  }, [containerId]);

  useEffect(() => {
    if (!mounted) {
      console.log(`⏳ Waiting for mount: ${containerId}`);
      return;
    }
    
    console.log(`📦 NativeAd mounted, preparing to show ad: ${containerId}`);
    
    // Verify container exists before showing ad with enhanced checking
    const checkAndShowAd = () => {
      const container = containerRef.current;
      const domContainer = document.getElementById(containerId);
      
      console.log(`🔍 Container check for ${containerId}:`, {
        containerRef: !!container,
        domElement: !!domContainer,
        containerBounds: container?.getBoundingClientRect(),
        containerVisible: container ? container.offsetParent !== null : false
      });
      
      if (container && domContainer) {
        console.log(`✅ Container ${containerId} verified, showing ad...`);
        showNativeAd();
        setContainerError(null);
      } else {
        const errorMsg = `Container ${containerId} verification failed - ref: ${!!container}, dom: ${!!domContainer}`;
        console.error(`❌ ${errorMsg}`);
        setContainerError(errorMsg);
      }
    };

    // Delay to ensure DOM is fully ready
    const timer = setTimeout(checkAndShowAd, 300);

    return () => {
      clearTimeout(timer);
      console.log(`🧹 Cleanup: Hiding ad for container ${containerId}`);
      hideNativeAd();
    };
  }, [showNativeAd, hideNativeAd, containerId, mounted]);

  // Enhanced error logging
  useEffect(() => {
    if (error || containerError) {
      console.error(`❌ NativeAd ERROR for ${containerId}:`, {
        hookError: error,
        containerError,
        adId: actualAdId,
        testMode,
        timestamp: new Date().toISOString()
      });
    }
  }, [error, containerError, containerId, actualAdId, testMode]);

  return (
    <div className={`native-ad-wrapper my-4 ${className}`}>
      {testMode && (
        <div className="mb-2 text-xs text-muted-foreground text-center">
          🧪 Test Mode - Using Google Sample Ad
        </div>
      )}
      
      {/* Loading state with better UX */}
      {isLoading && (
        <div className="bg-muted/20 border border-border rounded-lg p-4 text-center animate-pulse">
          <div className="w-full h-16 bg-muted/40 rounded animate-pulse mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading ad...</p>
          <p className="text-xs text-muted-foreground/60 mt-1">ID: {containerId}</p>
        </div>
      )}
      
      {/* Enhanced error display */}
      {(error || containerError) && !isLoading && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-center">
          <p className="text-xs text-destructive font-medium">
            Ad Load Error
          </p>
          <p className="text-xs text-destructive/80 mt-1">
            {error || containerError}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Container: {containerId}
          </p>
        </div>
      )}
      
      {/* The actual ad container - ALWAYS rendered with stable ID */}
      <div 
        id={containerId} 
        ref={containerRef}
        className="native-ad-container min-h-[80px]"
        style={{ 
          position: 'relative',
          display: 'block',
          width: '100%',
          minHeight: '80px'
        }}
      />
      
      {/* Enhanced debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-muted/10 rounded text-xs text-muted-foreground opacity-75">
          <div>Container: {containerId}</div>
          <div>Ad ID: {actualAdId}</div>
          <div>Test Mode: {testMode.toString()}</div>
          <div>Mounted: {mounted.toString()}</div>
          <div>Loading: {isLoading.toString()}</div>
          <div>Platform: {typeof window !== 'undefined' && window.Capacitor?.isNativePlatform() ? 'Native' : 'Web'}</div>
        </div>
      )}
    </div>
  );
};
