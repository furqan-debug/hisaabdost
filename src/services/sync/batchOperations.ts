import { supabase } from "@/integrations/supabase/client";
import { TimeoutUtils } from "./timeoutUtils";
import type { SupabaseResponse, ConnectionQuality } from "./types";

export class BatchOperations {
  static async batchInsertExpenses(
    expenses: any[], 
    userId: string, 
    connectionQuality: ConnectionQuality
  ): Promise<number> {
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

        const timeout = this.getTimeoutForOperation(8000, connectionQuality); // 8 second base timeout
        
        const result = await TimeoutUtils.withTimeout(
          supabase.from('expenses').insert(expenseData) as unknown as Promise<SupabaseResponse>,
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

  static async batchInsertWalletAdditions(
    walletAdditions: any[], 
    userId: string, 
    connectionQuality: ConnectionQuality
  ): Promise<number> {
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

      const timeout = this.getTimeoutForOperation(6000, connectionQuality);
      
      const result = await TimeoutUtils.withTimeout(
        supabase.from('wallet_additions').insert(walletData) as unknown as Promise<SupabaseResponse>,
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

  static async batchInsertBudgets(
    budgets: any[], 
    userId: string, 
    connectionQuality: ConnectionQuality
  ): Promise<number> {
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

      const timeout = this.getTimeoutForOperation(6000, connectionQuality);
      
      const result = await TimeoutUtils.withTimeout(
        supabase.from('budgets').insert(budgetData) as unknown as Promise<SupabaseResponse>,
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

  private static getTimeoutForOperation(baseTimeout: number, connectionQuality: ConnectionQuality): number {
    // Adjust timeout based on connection quality
    if (connectionQuality.isSlowConnection) {
      return baseTimeout * 2; // Double timeout for slow connections
    }
    return baseTimeout;
  }
}