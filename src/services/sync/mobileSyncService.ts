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
  private maxRetries = 3;

  static getInstance(): MobileSyncService {
    if (!this.instance) {
      this.instance = new MobileSyncService();
    }
    return this.instance;
  }

  async syncPendingData(): Promise<boolean> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return false;
    }

    this.syncInProgress = true;
    console.log('Starting mobile-optimized data sync...');

    try {
      // Detect connection quality first
      this.connectionQuality = await ConnectionUtils.detectConnectionQuality();
      console.log('Connection quality:', this.connectionQuality);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user, skipping sync');
        return false;
      }

      const pendingData = offlineStorage.getPendingSync();
      let totalSyncCount = 0;

      // Show progress toast for mobile users
      const progressToast = toast.loading("Syncing data to cloud...", {
        duration: Infinity
      });

      try {
        // Sync expenses first (highest priority)
        if (pendingData.expense?.length > 0) {
          const expenseCount = await BatchOperations.batchInsertExpenses(
            pendingData.expense, 
            user.id, 
            this.connectionQuality
          );
          totalSyncCount += expenseCount;
          
          if (expenseCount > 0) {
            toast.dismiss(progressToast);
            toast.loading(`Synced ${expenseCount} expenses. Continuing...`, {
              duration: 2000
            });
          }
        }

        // Sync wallet additions
        if (pendingData.wallet?.length > 0) {
          const walletCount = await BatchOperations.batchInsertWalletAdditions(
            pendingData.wallet, 
            user.id, 
            this.connectionQuality
          );
          totalSyncCount += walletCount;
        }

        // Sync budgets
        if (pendingData.budget?.length > 0) {
          const budgetCount = await BatchOperations.batchInsertBudgets(
            pendingData.budget, 
            user.id, 
            this.connectionQuality
          );
          totalSyncCount += budgetCount;
        }

        toast.dismiss(progressToast);

        if (totalSyncCount > 0) {
          // Clear pending data only if we had some success
          offlineStorage.clearPendingSync();
          
          // Single debounced event dispatch after all sync operations
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('data-synced', {
              detail: { syncCount: totalSyncCount, source: 'mobile-sync' }
            }));
          }, 200);

          toast.success(`Successfully synced ${totalSyncCount} items to the cloud`);
          this.retryCount = 0; // Reset retry count on success
        } else {
          toast.error('No data was synced. Will retry automatically.');
        }

        console.log(`Mobile sync completed. Synced ${totalSyncCount} items.`);
        return totalSyncCount > 0;

      } catch (error) {
        toast.dismiss(progressToast);
        throw error;
      }

    } catch (error) {
      console.error('Mobile sync failed:', error);
      
      // Implement retry logic with exponential backoff
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Scheduling retry ${this.retryCount}/${this.maxRetries}`);
        
        setTimeout(async () => {
          await TimeoutUtils.exponentialBackoff(this.retryCount - 1);
          this.syncPendingData(); // Retry
        }, 1000);
        
        toast.error(`Sync failed. Retrying... (${this.retryCount}/${this.maxRetries})`);
      } else {
        this.retryCount = 0;
        toast.error('Sync failed after multiple attempts. Will retry when app reopens.');
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