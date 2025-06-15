
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface OfflineHookReturn {
  isOnline: boolean;
  isOffline: boolean;
  syncData: () => Promise<void>;
  pendingSync: boolean;
}

export function useOffline(): OfflineHookReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('App came online');
      setIsOnline(true);
      toast.success('Back online! Syncing data...');
      syncData();
    };

    const handleOffline = () => {
      console.log('App went offline');
      setIsOnline(false);
      toast.warning('You are offline. Changes will be saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncData = async () => {
    if (!isOnline) return;
    
    setPendingSync(true);
    try {
      // Trigger background sync if service worker supports it
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('expense-sync');
        await registration.sync.register('budget-sync');
        console.log('Background sync registered');
      }
      
      // Dispatch custom events for components to handle sync
      window.dispatchEvent(new CustomEvent('offline-sync-requested', {
        detail: { timestamp: Date.now() }
      }));
      
      setTimeout(() => {
        setPendingSync(false);
        toast.success('Data synced successfully!');
      }, 2000);
    } catch (error) {
      console.error('Sync failed:', error);
      setPendingSync(false);
      toast.error('Sync failed. Will retry when connectivity improves.');
    }
  };

  return {
    isOnline,
    isOffline: !isOnline,
    syncData,
    pendingSync
  };
}
