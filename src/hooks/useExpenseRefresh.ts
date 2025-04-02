
import { useEffect, useState } from 'react';

/**
 * Custom hook to listen for expense update events
 * and trigger refreshes in the expense list
 */
export function useExpenseRefresh() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    // Listen for the custom expense-updated event
    const handleExpensesUpdated = (event: Event) => {
      console.log("Expense updated event received, triggering refresh");
      setRefreshTrigger(prev => prev + 1);
    };
    
    // Listen for receipt-scanned event
    const handleReceiptScanned = (event: Event) => {
      console.log("Receipt scanned event received, triggering refresh");
      setRefreshTrigger(prev => prev + 1);
    };
    
    // Add event listeners
    window.addEventListener('expenses-updated', handleExpensesUpdated);
    window.addEventListener('receipt-scanned', handleReceiptScanned);
    
    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('expenses-updated', handleExpensesUpdated);
      window.removeEventListener('receipt-scanned', handleReceiptScanned);
    };
  }, []);
  
  return { refreshTrigger };
}
