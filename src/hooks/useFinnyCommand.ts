
import { useFinny } from '@/components/finny/FinnyProvider';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/utils/formatters';
import { EXPENSE_CATEGORIES } from '@/components/expenses/form-fields/CategoryField';

/**
 * Hook to send commands to Finny programmatically
 */
export function useFinnyCommand() {
  const { addExpense, setBudget, askFinny, openChat } = useFinny();
  const auth = useAuth();
  const user = auth?.user || null;
  const { currencyCode } = useCurrency();

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
    let expenseDate = date;
    if (!expenseDate) {
      expenseDate = getTodaysDate();
    } else {
      // Validate the date
      try {
        const dateObj = new Date(expenseDate);
        if (isNaN(dateObj.getTime()) || dateObj.getFullYear() < 2020 || dateObj.getFullYear() > 2030) {
          console.log(`Invalid date ${expenseDate}, using today's date instead`);
          expenseDate = getTodaysDate();
        }
      } catch (e) {
        console.log(`Error parsing date ${expenseDate}, using today's date instead`);
        expenseDate = getTodaysDate();
      }
    }
    
    addExpense(amount, validCategory, description, expenseDate);
    
    // Immediately trigger multiple refresh events to ensure the expense list updates
    const event = new CustomEvent('expense-added');
    window.dispatchEvent(event);
    
    setTimeout(() => {
      const updateEvent = new CustomEvent('expenses-updated', { 
        detail: { timestamp: Date.now() }
      });
      window.dispatchEvent(updateEvent);
    }, 100);
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
    const message = `Delete my ${validCategory} expense${date ? ` from ${date}` : ''}`;
    askFinny(message);
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
