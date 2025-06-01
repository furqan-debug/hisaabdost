
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLogData {
  action_type: 'expense' | 'budget' | 'goal' | 'wallet' | 'income' | 'profile';
  action_description: string;
  amount?: number;
  category?: string;
  metadata?: any;
}

export const logActivity = async (data: ActivityLogData) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.user.id,
        ...data
      });

    if (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Helper functions for common activities
export const logExpenseActivity = async (action: 'added' | 'updated' | 'deleted', expense: {
  description: string;
  amount: number;
  category: string;
  id?: string;
}) => {
  await logActivity({
    action_type: 'expense',
    action_description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${expense.description} expense`,
    amount: expense.amount,
    category: expense.category,
    metadata: { expense_id: expense.id }
  });
};

export const logBudgetActivity = async (action: 'set' | 'updated', budget: {
  category: string;
  amount: number;
  period: string;
  id?: string;
}) => {
  await logActivity({
    action_type: 'budget',
    action_description: `${action === 'set' ? 'Set' : 'Updated'} ${budget.category} budget for ${budget.period}`,
    amount: budget.amount,
    category: budget.category,
    metadata: { budget_id: budget.id }
  });
};

export const logGoalActivity = async (action: 'created' | 'updated', goal: {
  title: string;
  target_amount: number;
  category: string;
  id?: string;
}) => {
  await logActivity({
    action_type: 'goal',
    action_description: `${action === 'created' ? 'Created' : 'Updated'} goal: ${goal.title}`,
    amount: goal.target_amount,
    category: goal.category,
    metadata: { goal_id: goal.id }
  });
};

export const logWalletActivity = async (amount: number, description?: string) => {
  await logActivity({
    action_type: 'wallet',
    action_description: description || `Added ${amount > 0 ? 'funds' : 'deducted funds'} to wallet`,
    amount: Math.abs(amount),
    category: 'Wallet',
    metadata: { transaction_type: amount > 0 ? 'addition' : 'deduction' }
  });
};

export const logIncomeActivity = async (newAmount: number, oldAmount?: number) => {
  const description = oldAmount 
    ? `Updated monthly income from ${oldAmount} to ${newAmount}`
    : `Set monthly income to ${newAmount}`;
    
  await logActivity({
    action_type: 'income',
    action_description: description,
    amount: newAmount,
    category: 'Income',
    metadata: { 
      old_amount: oldAmount || 0, 
      new_amount: newAmount,
      change_amount: newAmount - (oldAmount || 0)
    }
  });
};
