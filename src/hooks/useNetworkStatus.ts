
import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'fast' | 'slow' | 'unknown'>('unknown');

  // Detect connection quality for mobile optimization
  const detectConnectionQuality = async () => {
    if (!navigator.onLine) {
      setConnectionQuality('unknown');
      return;
    }

    try {
      const startTime = Date.now();
      // Simple ping test - try to fetch a small resource
      await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      const latency = Date.now() - startTime;
      
      // Classify connection based on latency
      if (latency < 500) {
        setConnectionQuality('fast');
      } else {
        setConnectionQuality('slow');
      }
    } catch (error) {
      setConnectionQuality('slow');
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      console.log('Network: Back online');
      setWasOffline(!navigator.onLine);
      setIsOnline(true);
      
      // Detect connection quality when coming back online
      setTimeout(() => {
        detectConnectionQuality();
      }, 1000);
    };

    const handleOffline = () => {
      console.log('Network: Gone offline');
      setIsOnline(false);
      setWasOffline(true);
      setConnectionQuality('unknown');
    };

    // Initial connection quality detection
    if (navigator.onLine) {
      detectConnectionQuality();
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // For mobile devices, also listen to connection change events
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const handleConnectionChange = () => {
        console.log('Connection changed:', connection.effectiveType);
        // Re-detect quality when connection type changes
        if (navigator.onLine) {
          setTimeout(() => {
            detectConnectionQuality();
          }, 500);
        }
      };

      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    wasOffline,
    connectionQuality,
    resetWasOffline: () => setWasOffline(false)
  };
}
