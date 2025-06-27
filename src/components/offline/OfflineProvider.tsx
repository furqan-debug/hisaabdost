
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { syncService } from '@/services/syncService';
import { offlineStorage } from '@/services/offlineStorageService';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

interface OfflineContextType {
  isOnline: boolean;
  hasPendingSync: boolean;
  syncInProgress: boolean;
  triggerSync: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, wasOffline } = useNetworkStatus();
  const { user } = useAuth();
  const [hasPendingSync, setHasPendingSync] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Check for pending sync on mount and when user changes
  useEffect(() => {
    const checkPendingSync = () => {
      setHasPendingSync(offlineStorage.hasPendingSync());
    };
    
    checkPendingSync();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      checkPendingSync();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for when items are added to pending sync
    const handlePendingSync = () => {
      checkPendingSync();
    };
    
    window.addEventListener('pending-sync-updated', handlePendingSync);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pending-sync-updated', handlePendingSync);
    };
  }, [user]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && wasOffline && user && hasPendingSync) {
      console.log('Back online with pending data, triggering sync...');
      triggerSync();
    }
  }, [isOnline, wasOffline, user, hasPendingSync]);

  // Show offline status
  useEffect(() => {
    if (!isOnline) {
      toast.info('You are offline. Data will be saved locally and synced when connection is restored.', {
        duration: 5000,
      });
    }
  }, [isOnline]);

  const triggerSync = async () => {
    if (!user || syncInProgress) return;
    
    setSyncInProgress(true);
    try {
      await syncService.syncPendingData();
      setHasPendingSync(offlineStorage.hasPendingSync());
    } finally {
      setSyncInProgress(false);
    }
  };

  return (
    <OfflineContext.Provider value={{
      isOnline,
      hasPendingSync,
      syncInProgress,
      triggerSync
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
