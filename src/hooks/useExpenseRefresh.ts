
import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook to listen for expense update events
 * and trigger refreshes in the expense list
 */
export function useExpenseRefresh() {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const refreshTimerRef = useRef<number | null>(null);
  
  const triggerRefresh = useCallback(() => {
    // Throttle refreshes to prevent multiple rapid refreshes
    const now = Date.now();
    if (now - lastRefreshTime > 200) { // Reduced throttle time for more responsive updates
      console.log("Manually triggering refresh");
      setRefreshTrigger(prev => prev + 1);
      setLastRefreshTime(now);
    }
  }, [lastRefreshTime]);
  
  // Function to handle various expense update events
  const handleExpenseUpdateEvent = useCallback((event: Event) => {
    const eventName = event.type;
    const customEvent = event as CustomEvent;
    const detail = customEvent.detail || {};
    
    console.log(`${eventName} event received, preparing to refresh data`, detail);
    
    // Clear any existing timer
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
    }
    
    // For Finny-related events, trigger immediate refresh
    const isFinnyEvent = detail.source === 'finny-chat';
    const timeout = isFinnyEvent ? 50 : 200; // Faster refresh for Finny events
    
    // Set a short timeout to batch potential multiple events
    refreshTimerRef.current = window.setTimeout(() => {
      console.log(`Refreshing expense list from ${eventName} event`);
      setRefreshTrigger(prev => prev + 1);
      setLastRefreshTime(Date.now());
      refreshTimerRef.current = null;
      
      // Show toast for Finny events
      if (isFinnyEvent && eventName === 'expense-added') {
        toast.success("Expense added via Finny!");
      } else if (eventName === 'expense-added' && !isFinnyEvent) {
        toast.success("Expense added successfully!");
      } else if (eventName === 'expense-edited') {
        toast.success("Expense updated successfully!");
      } else if (eventName === 'expense-deleted') {
        toast.success("Expense deleted successfully!");
      }
    }, timeout);
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
    window.addEventListener('expense-refresh', handleExpenseUpdateEvent);
    window.addEventListener('custom-date-change', handleExpenseUpdateEvent);
    window.addEventListener('finny-expense-added', handleExpenseUpdateEvent);
    
    // Cleanup listeners on unmount
    return () => {
      console.log("Removing expense refresh event listeners");
      window.removeEventListener('expenses-updated', handleExpenseUpdateEvent);
      window.removeEventListener('receipt-scanned', handleExpenseUpdateEvent);
      window.removeEventListener('expense-added', handleExpenseUpdateEvent);
      window.removeEventListener('expense-edited', handleExpenseUpdateEvent);
      window.removeEventListener('expense-deleted', handleExpenseUpdateEvent);
      window.removeEventListener('expense-refresh', handleExpenseUpdateEvent);
      window.removeEventListener('custom-date-change', handleExpenseUpdateEvent);
      window.removeEventListener('finny-expense-added', handleExpenseUpdateEvent);
      
      // Clear any pending timeout
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [handleExpenseUpdateEvent]);
  
  // Always return an object with defined values
  return { 
    refreshTrigger: refreshTrigger || 0, 
    triggerRefresh 
  };
}
