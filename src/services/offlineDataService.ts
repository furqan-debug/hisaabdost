
import { supabase } from '@/integrations/supabase/client';
import { OfflineStorageService } from './offlineStorageService';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { toast } from 'sonner';

export class OfflineDataService {
  private static instance: OfflineDataService;
  private storageService: OfflineStorageService;
  private isInitialized = false;

  constructor() {
    this.storageService = OfflineStorageService.getInstance();
  }

  static getInstance(): OfflineDataService {
    if (!OfflineDataService.instance) {
      OfflineDataService.instance = new OfflineDataService();
    }
    return OfflineDataService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.storageService.initialize();
      this.isInitialized = true;
      console.log('Offline data service initialized');
    } catch (error) {
      console.error('Failed to initialize offline data service:', error);
      throw error;
    }
  }

  // Expense operations
  async createExpense(expenseData: any): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const expense = {
        id: crypto.randomUUID(),
        user_id: user.id,
        ...expenseData,
        created_at: new Date().toISOString()
      };

      // Store offline first
      await this.storageService.create('expenses', expense);
      
      // Try to sync online if connected
      if (navigator.onLine) {
        try {
          await this.syncExpenseToServer(expense);
        } catch (error) {
          console.log('Online sync failed, will retry later:', error);
        }
      } else {
        toast.info('Expense saved offline - will sync when connected');
      }

      return expense.id;
    } catch (error) {
      console.error('Failed to create expense:', error);
      throw error;
    }
  }

  async getExpenses(userId?: string): Promise<any[]> {
    try {
      // Always return offline data first for immediate UI response
      const offlineExpenses = await this.storageService.readAll('expenses', userId);
      
      // If online, try to fetch latest data and merge
      if (navigator.onLine) {
        try {
          const { data: onlineExpenses, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', userId || '')
            .order('created_at', { ascending: false });

          if (!error && onlineExpenses) {
            // Merge online and offline data (prioritize offline for pending changes)
            return this.mergeExpenseData(offlineExpenses, onlineExpenses);
          }
        } catch (error) {
          console.log('Failed to fetch online data, using offline:', error);
        }
      }

      return offlineExpenses;
    } catch (error) {
      console.error('Failed to get expenses:', error);
      return [];
    }
  }

  async updateExpense(id: string, updates: any): Promise<void> {
    try {
      // Update offline first
      await this.storageService.update('expenses', id, updates);
      
      // Try to sync online if connected
      if (navigator.onLine) {
        try {
          await this.syncExpenseUpdateToServer(id, updates);
        } catch (error) {
          console.log('Online sync failed, will retry later:', error);
        }
      } else {
        toast.info('Changes saved offline - will sync when connected');
      }
    } catch (error) {
      console.error('Failed to update expense:', error);
      throw error;
    }
  }

  async deleteExpense(id: string): Promise<void> {
    try {
      // Delete from offline storage
      await this.storageService.delete('expenses', id);
      
      // Try to sync online if connected
      if (navigator.onLine) {
        try {
          await supabase.from('expenses').delete().eq('id', id);
        } catch (error) {
          console.log('Online sync failed, will retry later:', error);
        }
      } else {
        toast.info('Expense deleted offline - will sync when connected');
      }
    } catch (error) {
      console.error('Failed to delete expense:', error);
      throw error;
    }
  }

  // Budget operations
  async createBudget(budgetData: any): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const budget = {
        id: crypto.randomUUID(),
        user_id: user.id,
        ...budgetData,
        created_at: new Date().toISOString()
      };

      await this.storageService.create('budgets', budget);
      
      if (navigator.onLine) {
        try {
          await this.syncBudgetToServer(budget);
        } catch (error) {
          console.log('Online sync failed, will retry later:', error);
        }
      } else {
        toast.info('Budget saved offline - will sync when connected');
      }

      return budget.id;
    } catch (error) {
      console.error('Failed to create budget:', error);
      throw error;
    }
  }

  async getBudgets(userId?: string): Promise<any[]> {
    try {
      const offlineBudgets = await this.storageService.readAll('budgets', userId);
      
      if (navigator.onLine) {
        try {
          const { data: onlineBudgets, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', userId || '')
            .order('created_at', { ascending: false });

          if (!error && onlineBudgets) {
            return this.mergeBudgetData(offlineBudgets, onlineBudgets);
          }
        } catch (error) {
          console.log('Failed to fetch online budgets, using offline:', error);
        }
      }

      return offlineBudgets;
    } catch (error) {
      console.error('Failed to get budgets:', error);
      return [];
    }
  }

  // Sync helper methods
  private async syncExpenseToServer(expense: any): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .insert({
        id: expense.id,
        user_id: expense.user_id,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        category: expense.category,
        payment: expense.payment,
        notes: expense.notes,
        is_recurring: expense.is_recurring,
        receipt_url: expense.receipt_url
      });

    if (error) throw error;
    
    // Mark as synced in offline storage
    await this.storageService.update('expenses', expense.id, { sync_status: 'synced' });
  }

  private async syncExpenseUpdateToServer(id: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    
    // Mark as synced in offline storage
    await this.storageService.update('expenses', id, { sync_status: 'synced' });
  }

  private async syncBudgetToServer(budget: any): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .insert({
        id: budget.id,
        user_id: budget.user_id,
        amount: budget.amount,
        category: budget.category,
        period: budget.period,
        carry_forward: budget.carry_forward,
        monthly_income: budget.monthly_income
      });

    if (error) throw error;
    
    await this.storageService.update('budgets', budget.id, { sync_status: 'synced' });
  }

  // Data merging methods
  private mergeExpenseData(offlineData: any[], onlineData: any[]): any[] {
    const merged = new Map();
    
    // Add online data first
    onlineData.forEach(item => {
      merged.set(item.id, { ...item, source: 'online' });
    });
    
    // Override with offline data for pending items
    offlineData.forEach(item => {
      if (item.sync_status === 'pending') {
        merged.set(item.id, { ...item, source: 'offline' });
      }
    });
    
    return Array.from(merged.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  private mergeBudgetData(offlineData: any[], onlineData: any[]): any[] {
    const merged = new Map();
    
    onlineData.forEach(item => {
      merged.set(item.id, { ...item, source: 'online' });
    });
    
    offlineData.forEach(item => {
      if (item.sync_status === 'pending') {
        merged.set(item.id, { ...item, source: 'offline' });
      }
    });
    
    return Array.from(merged.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Utility methods
  async getOfflineInfo(): Promise<{ totalRecords: number; pendingSync: number }> {
    return this.storageService.getStorageInfo();
  }

  async clearOfflineData(): Promise<void> {
    await this.storageService.clearAll();
    toast.success('Offline data cleared');
  }
}
