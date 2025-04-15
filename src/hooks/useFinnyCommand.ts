
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
    
    addExpense(amount, category, description, date);
  };
  
  /**
   * Send a command to Finny to set a budget
   */
  const createBudget = (amount: number, category: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    setBudget(amount, category);
  };
  
  /**
   * Send a custom query to Finny
   */
  const askQuestion = (question: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }
    
    askFinny(question);
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

  return {
    recordExpense,
    createBudget,
    askQuestion,
    requestSpendingSummary,
    openChat
  };
}
