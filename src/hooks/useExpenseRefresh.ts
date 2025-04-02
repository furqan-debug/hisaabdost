
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to handle expense list refreshes across the application
 * Uses a counter and event listeners to ensure all components stay in sync
 */
export function useExpenseRefresh() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Function to manually trigger a refresh
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  // Listen for receipt-scanned and expenses-updated events to automatically trigger refreshes
  useEffect(() => {
    const handleReceiptScanned = () => {
      console.log("Receipt scanned event detected in useExpenseRefresh, triggering refresh");
      triggerRefresh();
    };
    
    const handleExpensesUpdated = () => {
      console.log("Expenses updated event detected in useExpenseRefresh, triggering refresh");
      triggerRefresh();
    };
    
    // Add event listeners
    window.addEventListener('receipt-scanned', handleReceiptScanned);
    window.addEventListener('expenses-updated', handleExpensesUpdated);
    
    // Clean up
    return () => {
      window.removeEventListener('receipt-scanned', handleReceiptScanned);
      window.removeEventListener('expenses-updated', handleExpensesUpdated);
    };
  }, [triggerRefresh]);
  
  return { refreshTrigger, triggerRefresh };
}
