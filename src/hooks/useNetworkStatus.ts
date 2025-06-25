
import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
}

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown'
  });

  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      const isOnline = navigator.onLine;
      const previousOnline = networkStatus.isOnline;
      
      // Track if we just came back online
      if (!previousOnline && isOnline) {
        setWasOffline(true);
        // Reset the flag after a short delay
        setTimeout(() => setWasOffline(false), 1000);
      }

      let connectionType: NetworkStatus['connectionType'] = 'unknown';
      let effectiveType: NetworkStatus['effectiveType'] = 'unknown';
      let isSlowConnection = false;

      if (connection) {
        // Map connection type
        switch (connection.type) {
          case 'wifi':
            connectionType = 'wifi';
            break;
          case 'cellular':
            connectionType = 'cellular';
            break;
          case 'ethernet':
            connectionType = 'ethernet';
            break;
          default:
            connectionType = 'unknown';
        }

        // Map effective type
        switch (connection.effectiveType) {
          case 'slow-2g':
            effectiveType = 'slow-2g';
            isSlowConnection = true;
            break;
          case '2g':
            effectiveType = '2g';
            isSlowConnection = true;
            break;
          case '3g':
            effectiveType = '3g';
            break;
          case '4g':
            effectiveType = '4g';
            break;
          default:
            effectiveType = 'unknown';
        }
      }

      setNetworkStatus({
        isOnline,
        isSlowConnection,
        connectionType,
        effectiveType
      });
    };

    // Initial check
    updateNetworkStatus();

    // Listen for network changes
    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    const handleConnectionChange = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for connection changes if supported
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [networkStatus.isOnline]);

  return {
    ...networkStatus,
    wasOffline,
    isConnected: networkStatus.isOnline,
    isDisconnected: !networkStatus.isOnline,
    hasSlowConnection: networkStatus.isSlowConnection,
    connectionQuality: networkStatus.isOnline ? 
      (networkStatus.isSlowConnection ? 'slow' : 'good') : 'offline'
  };
}
