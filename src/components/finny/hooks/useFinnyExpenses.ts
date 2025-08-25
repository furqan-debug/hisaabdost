
import { useCallback } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/formatters';
import { validateCategory } from '../utils/categoryUtils';
import { createFinnyActionService } from '../services/finnyActionService';
import { MAX_DAILY_MESSAGES } from '../context/FinnyContext';

interface UseFinnyExpensesProps {
  user: any;
  currencyCode: string;
  isMessageLimitReached: boolean;
  triggerChat: (message: string) => Promise<void>;
}

export const useFinnyExpenses = ({
  user,
  currencyCode,
  isMessageLimitReached,
  triggerChat
}: UseFinnyExpensesProps) => {
  const actionService = createFinnyActionService();

  const addExpense = useCallback(async (
    amount: number, 
    category: string, 
    description?: string, 
    date?: string
  ) => {
    try {
      if (isMessageLimitReached) {
        toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
        return;
      }

      const validation = actionService.validateExpenseInputs(amount, category);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const formattedAmount = formatCurrency(amount, currencyCode);
      const validCategory = validateCategory(category);
      
      let message = `Add expense of ${formattedAmount} for ${validCategory}`;
      
      if (validCategory !== category) {
        message += ` (originally requested as "${category}")`;
      }
      
      if (description) {
        message += ` for ${description}`;
      }

      message += date ? ` on ${date}` : ` on ${today}`;
      
      await triggerChat(message);

      // Enhanced refresh event handling
      const triggerRefreshEvents = () => {
        actionService.triggerRefreshEvents('add_expense', {
          amount,
          category: validCategory,
          description,
          date: date || today
        });
      };

      // Multiple refresh triggers to ensure UI updates
      setTimeout(triggerRefreshEvents, 100);
      setTimeout(triggerRefreshEvents, 500);
      setTimeout(triggerRefreshEvents, 1000);
      setTimeout(triggerRefreshEvents, 2000);
      
    } catch (error) {
      console.error('Error adding expense via Finny:', error);
      toast.error("Failed to add expense. Please try again.");
    }
  }, [user, currencyCode, isMessageLimitReached, triggerChat, actionService]);

  return { addExpense };
};
