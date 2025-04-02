
import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook to listen for expense update events
 * and trigger refreshes in the expense list
 */
export function useExpenseRefresh() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const refreshTimerRef = useRef<number | null>(null);
  
  const triggerRefresh = useCallback(() => {
    // Throttle refreshes to prevent multiple rapid refreshes
    const now = Date.now();
    if (now - lastRefreshTime > 500) { // Only refresh if more than 500ms has passed
      console.log("Manually triggering refresh");
      setRefreshTrigger(prev => prev + 1);
      setLastRefreshTime(now);
    }
  }, [lastRefreshTime]);
  
  // Function to handle various expense update events
  const handleExpenseUpdateEvent = useCallback((event: Event) => {
    const eventName = event.type;
    console.log(`${eventName} event received, preparing to refresh data`);
    
    // Clear any existing timer
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
    }
    
    // Set a short timeout to batch potential multiple events
    refreshTimerRef.current = window.setTimeout(() => {
      console.log(`Refreshing expense list from ${eventName} event`);
      setRefreshTrigger(prev => prev + 1);
      setLastRefreshTime(Date.now());
      refreshTimerRef.current = null;
    }, 300);
  }, []);
  
  useEffect(() => {
    // Listen for all expense-related events
    console.log("Setting up expense refresh event listeners");
    
    // Add event listeners for various expense update events
    window.addEventListener('expenses-updated', handleExpenseUpdateEvent);
    window.addEventListener('receipt-scanned', handleExpenseUpdateEvent);
    window.addEventListener('expense-added', handleExpenseUpdateEvent);
    window.addEventListener('expense-edited', handleExpenseUpdateEvent);
    window.addEventListener('expense-deleted', handleExpenseUpdateEvent);
    
    // Cleanup listeners on unmount
    return () => {
      console.log("Removing expense refresh event listeners");
      window.removeEventListener('expenses-updated', handleExpenseUpdateEvent);
      window.removeEventListener('receipt-scanned', handleExpenseUpdateEvent);
      window.removeEventListener('expense-added', handleExpenseUpdateEvent);
      window.removeEventListener('expense-edited', handleExpenseUpdateEvent);
      window.removeEventListener('expense-deleted', handleExpenseUpdateEvent);
      
      // Clear any pending timeout
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [handleExpenseUpdateEvent]);
  
  return { refreshTrigger, triggerRefresh };
}
