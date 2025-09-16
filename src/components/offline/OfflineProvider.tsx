
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { syncService } from '@/services/syncService';
import { mobileSyncService } from '@/services/mobileSyncService';
import { offlineStorage } from '@/services/offlineStorageService';
import { toast } from 'sonner';
import { useAuthOptional } from '@/lib/auth';

interface OfflineContextType {
  isOnline: boolean;
  hasPendingSync: boolean;
  syncInProgress: boolean;
  triggerSync: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, wasOffline } = useNetworkStatus();
  const auth = useAuthOptional();
  const user = auth?.user ?? null;
  const [hasPendingSync, setHasPendingSync] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Detect if we're on mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

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

  // Auto-sync when coming back online with debouncing for mobile
  useEffect(() => {
    if (isOnline && wasOffline && user && hasPendingSync) {
      console.log('Back online with pending data, triggering sync...');
      
      // Add delay for mobile devices to allow network to stabilize
      const delay = isMobileDevice() ? 2000 : 500;
      
      setTimeout(() => {
        triggerSync();
      }, delay);
    }
  }, [isOnline, wasOffline, user, hasPendingSync]);

  // Show offline status with mobile-specific messaging
  useEffect(() => {
    if (!isOnline) {
      const message = isMobileDevice() 
        ? 'You are offline. Data will be saved locally and synced automatically when connection is restored.'
        : 'You are offline. Data will be saved locally and synced when connection is restored.';
        
      toast.info(message, {
        duration: isMobileDevice() ? 6000 : 5000,
      });
    }
  }, [isOnline]);

  // Handle app lifecycle events for mobile
  useEffect(() => {
    if (!isMobileDevice()) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App going to background - cancel any ongoing sync
        console.log('App going to background, cancelling sync if needed');
        mobileSyncService.cancelSync();
      } else {
        // App coming to foreground - check if we need to sync
        console.log('App coming to foreground, checking for pending sync');
        if (isOnline && hasPendingSync) {
          setTimeout(() => {
            triggerSync();
          }, 1000);
        }
      }
    };

    const handleBeforeUnload = () => {
      mobileSyncService.cancelSync();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isOnline, hasPendingSync]);

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
