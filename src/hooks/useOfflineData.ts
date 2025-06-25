
import { useState, useEffect } from 'react';
import { OfflineDataService } from '@/services/offlineDataService';
import { useNetworkStatus } from './useNetworkStatus';
import { toast } from 'sonner';

export function useOfflineData() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [offlineInfo, setOfflineInfo] = useState({ totalRecords: 0, pendingSync: 0 });
  const { isOnline, wasOffline } = useNetworkStatus();
  const offlineService = OfflineDataService.getInstance();

  useEffect(() => {
    const initializeOfflineData = async () => {
      try {
        await offlineService.initialize();
        setIsInitialized(true);
        
        // Get initial offline info
        const info = await offlineService.getOfflineInfo();
        setOfflineInfo(info);
      } catch (error) {
        console.error('Failed to initialize offline data:', error);
        toast.error('Failed to initialize offline support');
      }
    };

    initializeOfflineData();
  }, []);

  useEffect(() => {
    if (wasOffline && isOnline) {
      toast.success('Back online! Syncing your changes...');
      // Trigger sync when coming back online
      refreshOfflineInfo();
    }
  }, [wasOffline, isOnline]);

  const refreshOfflineInfo = async () => {
    try {
      const info = await offlineService.getOfflineInfo();
      setOfflineInfo(info);
    } catch (error) {
      console.error('Failed to refresh offline info:', error);
    }
  };

  const clearOfflineData = async () => {
    try {
      await offlineService.clearOfflineData();
      setOfflineInfo({ totalRecords: 0, pendingSync: 0 });
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      toast.error('Failed to clear offline data');
    }
  };

  return {
    isInitialized,
    offlineInfo,
    refreshOfflineInfo,
    clearOfflineData,
    offlineService
  };
}
