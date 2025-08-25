
import { useCallback } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/formatters';
import { validateCategory } from '../utils/categoryUtils';
import { MAX_DAILY_MESSAGES } from '../context/FinnyContext';

interface UseFinnyBudgetsProps {
  user: any;
  currencyCode: string;
  isMessageLimitReached: boolean;
  triggerChat: (message: string) => Promise<void>;
}

export const useFinnyBudgets = ({
  user,
  currencyCode,
  isMessageLimitReached,
  triggerChat
}: UseFinnyBudgetsProps) => {
  
  const setBudget = useCallback(async (amount: number, category: string, period: string = "monthly") => {
    try {
      if (isMessageLimitReached) {
        toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
        return;
      }
      
      // Validate inputs
      if (!amount || amount <= 0) {
        toast.error("Please provide a valid budget amount");
        return;
      }
      
      if (!category) {
        toast.error("Please provide a category");
        return;
      }
      
      const formattedAmount = formatCurrency(amount, currencyCode);
      const validCategory = validateCategory(category);
      
      let message = `Set a ${period} budget of ${formattedAmount} for ${validCategory}`;
      
      if (validCategory !== category) {
        message += ` (originally requested as "${category}")`;
      }
      
      await triggerChat(message);
      
      // Trigger budget update events
      setTimeout(() => {
        const budgetEvent = new CustomEvent('budget-updated', { 
          detail: { 
            timestamp: Date.now(),
            action: 'set',
            category: validCategory,
            amount,
            period
          }
        });
        window.dispatchEvent(budgetEvent);
      }, 300);
      
    } catch (error) {
      console.error('Error setting budget via Finny:', error);
      toast.error("Failed to set budget. Please try again.");
    }
  }, [currencyCode, isMessageLimitReached, triggerChat]);
  
  const deleteBudget = useCallback(async (category: string) => {
    try {
      if (isMessageLimitReached) {
        toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
        return;
      }
      
      if (!category) {
        toast.error("Please provide a category");
        return;
      }
      
      const validCategory = validateCategory(category);
      let message = `Delete my ${validCategory} budget`;
      
      if (validCategory !== category) {
        message += ` (originally requested as "${category}")`;
      }
      
      await triggerChat(message);
      
      // Trigger budget update event
      setTimeout(() => {
        const budgetEvent = new CustomEvent('budget-updated', { 
          detail: { 
            timestamp: Date.now(),
            action: 'delete',
            category: validCategory
          }
        });
        window.dispatchEvent(budgetEvent);
      }, 300);
      
    } catch (error) {
      console.error('Error deleting budget via Finny:', error);
      toast.error("Failed to delete budget. Please try again.");
    }
  }, [isMessageLimitReached, triggerChat]);

  return { setBudget, deleteBudget };
};
