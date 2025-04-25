
import { useFinny } from '@/components/finny/FinnyProvider';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/utils/formatters';

/**
 * Hook to send commands to Finny programmatically
 */
export function useFinnyCommand() {
  const { addExpense, setBudget, askFinny, openChat } = useFinny();
  const { user } = useAuth();
  const { currencyCode } = useCurrency();

  /**
   * Send a command to Finny to add an expense
   */
  const recordExpense = (amount: number, category: string, description?: string, date?: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    const formattedAmount = formatCurrency(amount, currencyCode);
    const message = `Add an expense of ${formattedAmount} for ${category}${description ? ` for ${description}` : ''}${date ? ` on ${date}` : ' today'}`;
    askFinny(message);
  };
  
  /**
   * Send a command to Finny to set a budget
   */
  const createBudget = (amount: number, category: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    const formattedAmount = formatCurrency(amount, currencyCode);
    const message = `Set a budget of ${formattedAmount} for ${category}`;
    askFinny(message);
  };
  
  /**
   * Delete a budget by category
   */
  const deleteBudget = (category: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    const message = `Delete my ${category} budget`;
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
   * Request category-specific spending analysis
   */
  const requestCategoryAnalysis = (category: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    askFinny(`Show my ${category} spending breakdown`);
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
    
    const message = `Delete my ${category} expense${date ? ` from ${date}` : ''}`;
    askFinny(message);
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
    openChat
  };
}
