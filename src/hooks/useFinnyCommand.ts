
import { useFinny } from '@/components/finny/FinnyProvider';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

/**
 * Hook to send commands to Finny programmatically
 */
export function useFinnyCommand() {
  const { addExpense, setBudget, askFinny, openChat } = useFinny();
  const { user } = useAuth();

  /**
   * Send a command to Finny to add an expense
   */
  const recordExpense = (amount: number, category: string, description?: string, date?: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    const message = `Add an expense of ${amount} for ${category}${description ? ` for ${description}` : ''}${date ? ` on ${date}` : ' today'}`;
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
    
    const message = `Set a budget of ${amount} for ${category}`;
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
    
    const message = `I want to set a financial goal called "${title}" with a target amount of ${amount}${deadline ? ` by ${deadline}` : ''}`;
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
    askFinny,
    requestSpendingSummary,
    requestCategoryAnalysis,
    setFinancialGoal,
    deleteExpense,
    openChat
  };
}
