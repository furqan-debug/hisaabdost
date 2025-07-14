import { supabase } from "@/integrations/supabase/client";
import { offlineStorage } from "./offlineStorageService";
import { toast } from "sonner";
import { mobileSyncService } from "./mobileSyncService";

export class SyncService {
  private static instance: SyncService;
  private syncInProgress = false;

  static getInstance(): SyncService {
    if (!this.instance) {
      this.instance = new SyncService();
    }
    return this.instance;
  }

  // Detect if we're on mobile device
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  async syncPendingData(): Promise<boolean> {
    // Use mobile-optimized sync service for mobile devices
    if (this.isMobileDevice()) {
      console.log('Using mobile-optimized sync service');
      return await mobileSyncService.syncPendingData();
    }

    // Keep existing sync logic for web/desktop
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return false;
    }

    this.syncInProgress = true;
    console.log('Starting data sync...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user, skipping sync');
        return false;
      }

      const pendingData = offlineStorage.getPendingSync();
      let syncCount = 0;

      // Sync expenses
      if (pendingData.expense?.length > 0) {
        console.log(`Syncing ${pendingData.expense.length} expenses`);
        for (const expense of pendingData.expense) {
          try {
            const { error } = await supabase
              .from('expenses')
              .insert({
                user_id: user.id,
                amount: parseFloat(expense.amount.toString()),
                description: expense.description,
                date: expense.date,
                category: expense.category,
                payment: expense.paymentMethod || 'Cash',
                notes: expense.notes || '',
                is_recurring: expense.isRecurring || false,
                receipt_url: expense.receiptUrl || null
              });

            if (error) {
              console.error('Error syncing expense:', error);
            } else {
              syncCount++;
            }
          } catch (error) {
            console.error('Error processing expense sync:', error);
          }
        }
      }

      // Sync wallet additions
      if (pendingData.wallet?.length > 0) {
        console.log(`Syncing ${pendingData.wallet.length} wallet additions`);
        for (const walletAddition of pendingData.wallet) {
          try {
            const { error } = await supabase
              .from('wallet_additions')
              .insert({
                user_id: user.id,
                amount: walletAddition.amount,
                description: walletAddition.description || 'Added funds',
                date: walletAddition.date || new Date().toISOString().split('T')[0],
                fund_type: walletAddition.fund_type || 'manual'
              });

            if (error) {
              console.error('Error syncing wallet addition:', error);
            } else {
              syncCount++;
            }
          } catch (error) {
            console.error('Error processing wallet addition sync:', error);
          }
        }
      }

      // Sync budgets
      if (pendingData.budget?.length > 0) {
        console.log(`Syncing ${pendingData.budget.length} budgets`);
        for (const budget of pendingData.budget) {
          try {
            const { error } = await supabase
              .from('budgets')
              .insert({
                user_id: user.id,
                category: budget.category,
                amount: budget.amount,
                period: budget.period,
                monthly_income: budget.monthly_income || 0
              });

            if (error) {
              console.error('Error syncing budget:', error);
            } else {
              syncCount++;
            }
          } catch (error) {
            console.error('Error processing budget sync:', error);
          }
        }
      }

      if (syncCount > 0) {
        offlineStorage.clearPendingSync();
        toast.success(`Successfully synced ${syncCount} items to the cloud`);
        
        // Trigger data refresh
        window.dispatchEvent(new CustomEvent('data-synced'));
      }

      console.log(`Sync completed. Synced ${syncCount} items.`);
      return true;

    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync some data. Will retry when online.');
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  isSyncInProgress(): boolean {
    return this.syncInProgress || mobileSyncService.isSyncInProgress();
  }
}

export const syncService = SyncService.getInstance();
