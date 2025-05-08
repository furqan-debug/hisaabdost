import { useFinny } from '@/components/finny';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/utils/formatters';
import { EXPENSE_CATEGORIES } from '@/components/expenses/form-fields/CategoryField';
import { CurrencyCode } from '@/utils/currencyUtils';

/**
 * Hook to send commands to Finny programmatically
 */
export function useFinnyCommand() {
  const { addExpense, setBudget, askFinny, openChat } = useFinny();
  
  // Safely access auth context with fallback
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user || null;
  } catch (error) {
    console.error("Auth context not available:", error);
  }

  // Safely access currency context with fallback
  let currencyCode: CurrencyCode = 'USD';
  try {
    const currencyContext = useCurrency();
    currencyCode = currencyContext.currencyCode;
  } catch (error) {
    console.error("Currency context not available:", error);
  }

  /**
   * Validate a category against allowed expense categories
   */
  const validateCategory = (category: string): string => {
    if (!category) return 'Miscellaneous';
    
    // Check for exact match
    const exactMatch = EXPENSE_CATEGORIES.find(
      c => c.toLowerCase() === category.toLowerCase()
    );
    
    if (exactMatch) return exactMatch;
    
    // Look for partial matches
    const partialMatches = EXPENSE_CATEGORIES.filter(
      c => c.toLowerCase().includes(category.toLowerCase()) || 
           category.toLowerCase().includes(c.toLowerCase())
    );
    
    if (partialMatches.length > 0) {
      return partialMatches[0]; // Return the first partial match
    }
    
    // No match found, use miscellaneous as fallback
    return 'Other';
  };

  /**
   * Get today's date in YYYY-MM-DD format
   */
  const getTodaysDate = (): string => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  
  /**
   * Validate and format date
   */
  const validateDate = (dateStr?: string): string => {
    if (!dateStr) return getTodaysDate();
    
    try {
      // Check if it's already in ISO format YYYY-MM-DD
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        
        // If the year is unreasonable (too old or far future), use current date
        if (year < 2020 || year > 2030) {
          console.log(`Year ${year} is out of reasonable range, using today's date`);
          return getTodaysDate();
        }
        
        return dateStr;
      }
      
      // Try to parse the date
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        
        // If the year is unreasonable, use current date
        if (year < 2020 || year > 2030) {
          console.log(`Year ${year} is out of reasonable range, using today's date`);
          return getTodaysDate();
        }
        
        // Format as YYYY-MM-DD
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
    } catch (error) {
      console.error("Date validation error:", error);
    }
    
    // Default to today if parsing fails
    return getTodaysDate();
  };

  /**
   * Send a command to Finny to add an expense
   */
  const recordExpense = (amount: number, category: string, description?: string, date?: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    const validCategory = validateCategory(category);
    
    if (validCategory !== category) {
      toast.info(`Using category "${validCategory}" instead of "${category}"`);
    }
    
    // Make sure we use current date if none provided or if date is invalid
    const expenseDate = validateDate(date);
    
    // Always log the final date being used
    console.log(`Adding expense with date: ${expenseDate} (Original input: ${date || 'none'})`);
    
    addExpense(amount, validCategory, description, expenseDate);
    
    // Immediately trigger multiple refresh events to ensure the expense list updates
    const event = new CustomEvent('expense-added', {
      detail: {
        timestamp: Date.now(),
        amount, 
        category: validCategory,
        description, 
        date: expenseDate
      }
    });
    window.dispatchEvent(event);
    
    // Wait a bit and trigger another event
    setTimeout(() => {
      const updateEvent = new CustomEvent('expenses-updated', { 
        detail: { 
          timestamp: Date.now(),
          amount, 
          category: validCategory,
          description, 
          date: expenseDate
        }
      });
      window.dispatchEvent(updateEvent);
    }, 300);
    
    // Final refresh event
    setTimeout(() => {
      const finalEvent = new CustomEvent('expense-refresh', { 
        detail: { 
          timestamp: Date.now(),
          amount, 
          category: validCategory,
          description, 
          date: expenseDate
        }
      });
      window.dispatchEvent(finalEvent);
    }, 1000);
  };
  
  /**
   * Send a command to Finny to set a budget
   */
  const createBudget = (amount: number, category: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    const validCategory = validateCategory(category);
    
    if (validCategory !== category) {
      toast.info(`Using category "${validCategory}" instead of "${category}"`);
    }
    
    setBudget(amount, validCategory);
    
    // Trigger budget update event
    setTimeout(() => {
      const budgetEvent = new CustomEvent('budget-updated', { 
        detail: { 
          timestamp: Date.now(),
          amount,
          category: validCategory
        }
      });
      window.dispatchEvent(budgetEvent);
    }, 300);
  };
  
  /**
   * Delete a budget by category
   */
  const deleteBudget = (category: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    const validCategory = validateCategory(category);
    const message = `Delete my ${validCategory} budget`;
    askFinny(message);
    
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
  };
  
  /**
   * Request a spending summary
   */
  const requestSpendingSummary = () => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    askFinny("Show me a summary of my spending for this month");
  };
  
  /**
   * Request category-specific spending analysis with visualization
   */
  const requestCategoryAnalysis = (category: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    const validCategory = validateCategory(category);
    askFinny(`Show my ${validCategory} spending breakdown`);
  };
  
  /**
   * Create or update a financial goal
   */
  const setFinancialGoal = (title: string, amount: number, deadline?: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    const formattedAmount = formatCurrency(amount, currencyCode);
    const message = `I want to set a financial goal called "${title}" with a target amount of ${formattedAmount}${deadline ? ` by ${deadline}` : ''}`;
    askFinny(message);
    
    // Trigger goal update event
    setTimeout(() => {
      const goalEvent = new CustomEvent('goal-updated', { 
        detail: { 
          timestamp: Date.now(),
          title,
          amount,
          deadline
        }
      });
      window.dispatchEvent(goalEvent);
    }, 300);
  };
  
  /**
   * Delete a financial goal by title
   */
  const deleteFinancialGoal = (title: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    const message = `Delete my financial goal called "${title}"`;
    askFinny(message);
    
    // Trigger goal update event
    setTimeout(() => {
      const goalEvent = new CustomEvent('goal-updated', { 
        detail: { 
          timestamp: Date.now(),
          action: 'delete',
          title
        }
      });
      window.dispatchEvent(goalEvent);
    }, 300);
  };
  
  /**
   * Delete an expense by category and optionally date
   */
  const deleteExpense = (category: string, date?: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    const validCategory = validateCategory(category);
    const validDate = date ? validateDate(date) : undefined;
    const dateMsg = validDate ? ` from ${validDate}` : '';
    const message = `Delete my ${validCategory} expense${dateMsg}`;
    
    askFinny(message);
    
    // Trigger expense update events
    const event = new CustomEvent('expense-deleted', {
      detail: {
        timestamp: Date.now(),
        category: validCategory,
        date: validDate
      }
    });
    window.dispatchEvent(event);
    
    setTimeout(() => {
      const updateEvent = new CustomEvent('expenses-updated', { 
        detail: { 
          timestamp: Date.now(),
          action: 'delete',
          category: validCategory,
          date: validDate
        }
      });
      window.dispatchEvent(updateEvent);
    }, 300);
  };
  
  /**
   * Generate spending visualization only
   */
  const generateVisualization = () => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    askFinny("Generate a visualization of my spending by category");
  };

  return {
    recordExpense,
    createBudget,
    deleteBudget,
    askFinny,
    requestSpendingSummary,
    requestCategoryAnalysis,
    setFinancialGoal,
    deleteFinancialGoal,
    deleteExpense,
    generateVisualization,
    openChat
  };
}
