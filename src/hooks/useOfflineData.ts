import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface OfflineDataState {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingSyncCount: number;
  syncInProgress: boolean;
}

const STORAGE_KEY = 'hisaabdost_offline_data';

export function useOfflineData() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<OfflineDataState>({
    isOnline: navigator.onLine,
    lastSyncTime: getLastSyncTime(),
    pendingSyncCount: getPendingSyncCount(),
    syncInProgress: false,
  });

  useEffect(() => {
    const handleOnline = async () => {
      setState(prev => ({ ...prev, isOnline: true }));
      
      // Trigger sync when coming back online
      if (state.pendingSyncCount > 0) {
        await syncPendingData();
      }
      
      // Refresh all queries to get latest data
      queryClient.invalidateQueries();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.pendingSyncCount, queryClient]);

  const storeOfflineData = (key: string, data: any) => {
    try {
      const offlineData = getOfflineData();
      offlineData[key] = {
        data,
        timestamp: Date.now(),
        synced: false,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(offlineData));
      
      setState(prev => ({ 
        ...prev, 
        pendingSyncCount: Object.keys(offlineData).filter(k => !offlineData[k].synced).length 
      }));
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  };

  const getOfflineData = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const syncPendingData = async () => {
    if (state.syncInProgress || !state.isOnline) return;

    setState(prev => ({ ...prev, syncInProgress: true }));

    try {
      const offlineData = getOfflineData();
      const pendingItems = Object.entries(offlineData).filter(([_, item]: [string, any]) => !item.synced);

      console.log(`Syncing ${pendingItems.length} pending items...`);

      for (const [key, item] of pendingItems as [string, any][]) {
        try {
          // Parse the key to determine what type of data it is
          if (key.startsWith('expense_')) {
            await syncExpenseData(item.data);
          } else if (key.startsWith('budget_')) {
            await syncBudgetData(item.data);
          } else if (key.startsWith('wallet_')) {
            await syncWalletData(item.data);
          }

          // Mark as synced
          offlineData[key].synced = true;
        } catch (error) {
          console.error(`Failed to sync ${key}:`, error);
        }
      }

      // Update storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(offlineData));

      // Clean up old synced items (older than 7 days)
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const cleanedData = Object.fromEntries(
        Object.entries(offlineData).filter(([_, item]: [string, any]) => 
          !(item as any).synced || (item as any).timestamp > weekAgo
        )
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedData));

      setState(prev => ({ 
        ...prev, 
        lastSyncTime: new Date(),
        pendingSyncCount: Object.keys(cleanedData).filter(k => !(cleanedData[k] as any).synced).length
      }));

      // Update last sync time in localStorage
      localStorage.setItem('hisaabdost_last_sync', Date.now().toString());

    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setState(prev => ({ ...prev, syncInProgress: false }));
    }
  };

  return {
    ...state,
    storeOfflineData,
    getOfflineData,
    syncPendingData,
  };
}

// Helper functions
function getLastSyncTime(): Date | null {
  const time = localStorage.getItem('hisaabdost_last_sync');
  return time ? new Date(parseInt(time)) : null;
}

function getPendingSyncCount(): number {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return 0;
    
    const offlineData = JSON.parse(data);
    return Object.values(offlineData).filter((item: any) => !item.synced).length;
  } catch {
    return 0;
  }
}

// Sync helper functions (these would integrate with your existing APIs)
async function syncExpenseData(data: any) {
  // Implementation depends on your expense API
  console.log('Syncing expense:', data);
}

async function syncBudgetData(data: any) {
  // Implementation depends on your budget API
  console.log('Syncing budget:', data);
}

async function syncWalletData(data: any) {
  // Implementation depends on your wallet API
  console.log('Syncing wallet:', data);
}