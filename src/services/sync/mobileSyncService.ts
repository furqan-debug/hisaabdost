
import { supabase } from "@/integrations/supabase/client";
import { offlineStorage } from "../offlineStorageService";
import { toast } from "sonner";
import { ConnectionUtils } from "./connectionUtils";
import { BatchOperations } from "./batchOperations";
import { TimeoutUtils } from "./timeoutUtils";
import type { ConnectionQuality, SyncResult } from "./types";

export class MobileSyncService {
  private static instance: MobileSyncService;
  private syncInProgress = false;
  private connectionQuality: ConnectionQuality = {
    isSlowConnection: false,
    averageLatency: 0
  };
  private retryCount = 0;
  private maxRetries = 2; // Reduced from 3
  private lastSyncTime = 0;
  private syncCooldown = 30000; // 30 seconds cooldown between syncs

  static getInstance(): MobileSyncService {
    if (!this.instance) {
      this.instance = new MobileSyncService();
    }
    return this.instance;
  }

  async syncPendingData(): Promise<boolean> {
    // Check cooldown period to prevent excessive syncing
    const now = Date.now();
    if (now - this.lastSyncTime < this.syncCooldown) {
      console.log('Sync cooldown active, skipping');
      return false;
    }

    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return false;
    }

    this.syncInProgress = true;
    this.lastSyncTime = now;
    console.log('Starting mobile-optimized data sync...');

    try {
      // Quick connection check - don't proceed if offline
      if (!navigator.onLine) {
        console.log('Device is offline, skipping sync');
        return false;
      }

      // Detect connection quality first
      this.connectionQuality = await ConnectionUtils.detectConnectionQuality();
      console.log('Connection quality:', this.connectionQuality);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user, skipping sync');
        return false;
      }

      // Get user's active family context for syncing
      const { data: profileData } = await supabase
        .from('profiles')
        .select('active_family_id')
        .eq('id', user.id)
        .single();
      
      const activeFamilyId = profileData?.active_family_id || null;
      console.log('🔄 Syncing with family context:', activeFamilyId);

      const pendingData = offlineStorage.getPendingSync();
      let totalSyncCount = 0;

      // Check if there's actually data to sync
      const hasDataToSync = (pendingData.expense?.length || 0) + 
                           (pendingData.wallet?.length || 0) + 
                           (pendingData.budget?.length || 0) > 0;

      if (!hasDataToSync) {
        console.log('No pending data to sync');
        return false;
      }

      // Show progress toast for mobile users only if there's significant data
      const progressToast = totalSyncCount > 5 ? toast.loading("Syncing data to cloud...", {
        duration: 10000 // Shorter duration
      }) : null;

      try {
        // Sync expenses first (highest priority)
        if (pendingData.expense?.length > 0) {
          const expenseCount = await BatchOperations.batchInsertExpenses(
            pendingData.expense, 
            user.id, 
            this.connectionQuality,
            activeFamilyId
          );
          totalSyncCount += expenseCount;
        }

        // Sync wallet additions
        if (pendingData.wallet?.length > 0) {
          const walletCount = await BatchOperations.batchInsertWalletAdditions(
            pendingData.wallet, 
            user.id, 
            this.connectionQuality,
            activeFamilyId
          );
          totalSyncCount += walletCount;
        }

        // Sync budgets
        if (pendingData.budget?.length > 0) {
          const budgetCount = await BatchOperations.batchInsertBudgets(
            pendingData.budget, 
            user.id, 
            this.connectionQuality,
            activeFamilyId
          );
          totalSyncCount += budgetCount;
        }

        if (progressToast) {
          toast.dismiss(progressToast);
        }

        if (totalSyncCount > 0) {
          // Clear pending data only if we had some success
          offlineStorage.clearPendingSync();
          
          // Single debounced event dispatch after all sync operations
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('data-synced', {
              detail: { syncCount: totalSyncCount, source: 'mobile-sync' }
            }));
          }, 500); // Increased delay to prevent conflicts

          // Only show toast for significant syncs
          if (totalSyncCount > 1) {
            toast.success(`Successfully synced ${totalSyncCount} items to the cloud`);
          }
          this.retryCount = 0; // Reset retry count on success
        }

        console.log(`Mobile sync completed. Synced ${totalSyncCount} items.`);
        return totalSyncCount > 0;

      } catch (error) {
        if (progressToast) {
          toast.dismiss(progressToast);
        }
        throw error;
      }

    } catch (error) {
      console.error('Mobile sync failed:', error);
      
      // Simplified retry logic
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Scheduling retry ${this.retryCount}/${this.maxRetries}`);
        
        setTimeout(async () => {
          await TimeoutUtils.exponentialBackoff(this.retryCount - 1);
          this.syncPendingData(); // Retry
        }, 5000 * this.retryCount); // Longer delays
        
        // Don't show toast for every retry attempt
        if (this.retryCount === 1) {
          toast.error(`Sync failed. Retrying...`);
        }
      } else {
        this.retryCount = 0;
        toast.error('Sync failed. Will retry when app reopens.');
      }
      
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }

  // Cancel sync if app goes to background (mobile optimization)
  cancelSync(): void {
    if (this.syncInProgress) {
      console.log('Cancelling sync due to app backgrounding');
      this.syncInProgress = false;
    }
  }
}

export const mobileSyncService = MobileSyncService.getInstance();
