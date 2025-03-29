
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook to listen for expense update events
 * and trigger refreshes in the expense list
 */
export function useExpenseRefresh() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  
  const triggerRefresh = useCallback(() => {
    // Throttle refreshes to prevent multiple rapid refreshes
    const now = Date.now();
    if (now - lastRefreshTime > 500) { // Only refresh if more than 500ms has passed
      console.log("Manually triggering refresh");
      setRefreshTrigger(prev => prev + 1);
      setLastRefreshTime(now);
    }
  }, [lastRefreshTime]);
  
  useEffect(() => {
    // Listen for the custom expense-updated event
    const handleExpensesUpdated = (event: Event) => {
      console.log("Expense updated event received, triggering refresh");
      setRefreshTrigger(prev => prev + 1);
      setLastRefreshTime(Date.now());
    };
    
    // Listen for receipt-scanned event
    const handleReceiptScanned = (event: Event) => {
      console.log("Receipt scanned event received, triggering refresh");
      
      // Add a slight delay to ensure the database has been updated
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
        setLastRefreshTime(Date.now());
      }, 500);
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
  
  return { refreshTrigger, triggerRefresh };
}
