
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/formatters';
import { validateCategory } from '../utils/categoryUtils';

export interface FinnyActionService {
  triggerRefreshEvents: (actionType: string, details: any) => void;
  validateExpenseInputs: (amount: number, category: string) => { isValid: boolean; error?: string };
  validateBudgetInputs: (amount: number, category: string) => { isValid: boolean; error?: string };
}

export const createFinnyActionService = (): FinnyActionService => {
  const triggerRefreshEvents = (actionType: string, details: any) => {
    console.log("Triggering comprehensive refresh events for Finny action:", actionType);
    
    const events = [
      'expense-added',
      'expenses-updated', 
      'expense-refresh',
      'finny-expense-added',
      'dashboard-refresh'
    ];
    
    events.forEach(eventName => {
      const event = new CustomEvent(eventName, { 
        detail: { 
          timestamp: Date.now(),
          source: 'finny-chat',
          action: actionType,
          ...details
        }
      });
      window.dispatchEvent(event);
      console.log(`Dispatched ${eventName} event`);
    });
  };

  const validateExpenseInputs = (amount: number, category: string) => {
    if (!amount || amount <= 0) {
      return { isValid: false, error: "Please provide a valid amount" };
    }
    
    if (!category) {
      return { isValid: false, error: "Please provide a category" };
    }
    
    return { isValid: true };
  };

  const validateBudgetInputs = (amount: number, category: string) => {
    if (!amount || amount <= 0) {
      return { isValid: false, error: "Please provide a valid budget amount" };
    }
    
    if (!category) {
      return { isValid: false, error: "Please provide a category" };
    }
    
    return { isValid: true };
  };

  return {
    triggerRefreshEvents,
    validateExpenseInputs,
    validateBudgetInputs
  };
};
