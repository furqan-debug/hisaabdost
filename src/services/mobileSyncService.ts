
import { supabase } from "@/integrations/supabase/client";
import { offlineStorage } from "./offlineStorageService";
import { toast } from "sonner";

interface ConnectionQuality {
  isSlowConnection: boolean;
  averageLatency: number;
}

interface SupabaseResponse<T = any> {
  data: T | null;
  error: any;
}

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

  private async detectConnectionQuality(): Promise<ConnectionQuality> {
    const startTime = Date.now();
    try {
      // Simple ping to detect connection quality
      await supabase.from('expenses').select('id').limit(1);
      const latency = Date.now() - startTime;
      
      return {
        isSlowConnection: latency > 2000, // Consider slow if > 2 seconds
        averageLatency: latency
      };
    } catch (error) {
      return {
        isSlowConnection: true,
        averageLatency: 5000
      };
    }
  }

  private getTimeoutForOperation(baseTimeout: number): number {
    // Adjust timeout based on connection quality
    if (this.connectionQuality.isSlowConnection) {
      return baseTimeout * 2; // Double timeout for slow connections
    }
    return baseTimeout;
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    operation: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${operation} timeout after ${timeoutMs}ms`)), timeoutMs)
    );

    return Promise.race([promise, timeoutPromise]);
  }

  private async batchInsertExpenses(expenses: any[], userId: string): Promise<number> {
    if (expenses.length === 0) return 0;

    console.log(`Batch inserting ${expenses.length} expenses`);
    
    // Process in chunks of 10 for better mobile performance
    const chunkSize = 10;
    let successCount = 0;

    for (let i = 0; i < expenses.length; i += chunkSize) {
      const chunk = expenses.slice(i, i + chunkSize);
      
      try {
        const expenseData = chunk.map(expense => ({
          user_id: userId,
          amount: parseFloat(expense.amount.toString()),
          description: expense.description,
          date: expense.date,
          category: expense.category,
          payment: expense.paymentMethod || 'Cash',
          notes: expense.notes || '',
          is_recurring: expense.isRecurring || false,
          receipt_url: expense.receiptUrl || null
        }));

        const timeout = this.getTimeoutForOperation(8000); // 8 second base timeout
        
        const result = await this.withTimeout(
          supabase.from('expenses').insert(expenseData) as Promise<SupabaseResponse>,
          timeout,
          `Expense batch insert (chunk ${Math.floor(i / chunkSize) + 1})`
        );

        if (result.error) {
          console.error(`Error inserting expense chunk:`, result.error);
          // Continue with next chunk instead of failing completely
        } else {
          successCount += chunk.length;
        }

        // Small delay between chunks to prevent overwhelming mobile networks
        if (i + chunkSize < expenses.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`Error processing expense chunk:`, error);
        // Continue with next chunk
      }
    }

    return successCount;
  }

  private async batchInsertWalletAdditions(walletAdditions: any[], userId: string): Promise<number> {
    if (walletAdditions.length === 0) return 0;

    console.log(`Batch inserting ${walletAdditions.length} wallet additions`);

    try {
      const walletData = walletAdditions.map(addition => ({
        user_id: userId,
        amount: addition.amount,
        description: addition.description || 'Added funds',
        date: addition.date || new Date().toISOString().split('T')[0],
        fund_type: addition.fund_type || 'manual'
      }));

      const timeout = this.getTimeoutForOperation(6000);
      
      const result = await this.withTimeout(
        supabase.from('wallet_additions').insert(walletData) as Promise<SupabaseResponse>,
        timeout,
        'Wallet additions batch insert'
      );

      if (result.error) {
        console.error('Error inserting wallet additions:', result.error);
        return 0;
      }

      return walletAdditions.length;
    } catch (error) {
      console.error('Error processing wallet additions:', error);
      return 0;
    }
  }

  private async batchInsertBudgets(budgets: any[], userId: string): Promise<number> {
    if (budgets.length === 0) return 0;

    console.log(`Batch inserting ${budgets.length} budgets`);

    try {
      const budgetData = budgets.map(budget => ({
        user_id: userId,
        category: budget.category,
        amount: budget.amount,
        period: budget.period,
        monthly_income: budget.monthly_income || 0
      }));

      const timeout = this.getTimeoutForOperation(6000);
      
      const result = await this.withTimeout(
        supabase.from('budgets').insert(budgetData) as Promise<SupabaseResponse>,
        timeout,
        'Budgets batch insert'
      );

      if (result.error) {
        console.error('Error inserting budgets:', result.error);
        return 0;
      }

      return budgets.length;
    } catch (error) {
      console.error('Error processing budgets:', error);
      return 0;
    }
  }

  private async exponentialBackoff(attempt: number): Promise<void> {
    const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
    console.log(`Waiting ${delay}ms before retry attempt ${attempt + 1}`);
    await new Promise(resolve => setTimeout(resolve, delay));
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
      this.connectionQuality = await this.detectConnectionQuality();
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
          const expenseCount = await this.batchInsertExpenses(pendingData.expense, user.id);
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
          const walletCount = await this.batchInsertWalletAdditions(pendingData.wallet, user.id);
          totalSyncCount += walletCount;
        }

        // Sync budgets
        if (pendingData.budget?.length > 0) {
          const budgetCount = await this.batchInsertBudgets(pendingData.budget, user.id);
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
          await this.exponentialBackoff(this.retryCount - 1);
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
