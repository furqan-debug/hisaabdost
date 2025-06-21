
import { useAuth } from '@/lib/auth';
import { formatCurrency } from '@/utils/formatters';
import { EnhancedExtractor } from '../../utils/enhancedExpenseExtractor';
import { CurrencyCode } from '@/utils/currencyUtils';

export const useAutoExpenseProcessing = (currencyCode: CurrencyCode) => {
  const { user } = useAuth();

  const processAutoExpense = async (messageText: string) => {
    if (!user) return { processed: false, message: '' };

    const expenseData = EnhancedExtractor.extractExpense(messageText);
    
    if (expenseData && expenseData.confidence > 0.7) {
      try {
        console.log("Auto-processing expense:", expenseData);
        
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: expenseData.amount,
            category: expenseData.category,
            description: expenseData.description,
            date: expenseData.date || new Date().toISOString().split('T')[0]
          })
        });

        if (response.ok) {
          const autoMessage = `✅ Expense added: ${formatCurrency(expenseData.amount, currencyCode)} for ${expenseData.description} in ${expenseData.category}`;
          
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('expense-added'));
          }, 300);
          
          return { processed: true, message: autoMessage };
        }
      } catch (error) {
        console.error("Auto-expense processing failed:", error);
      }
    }

    return { processed: false, message: '' };
  };

  return { processAutoExpense };
};
