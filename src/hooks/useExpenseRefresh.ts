
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
    if (now - lastRefreshTime > 300) { // Reduced throttle time for more responsive updates
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
    
    // For receipt-related events, trigger immediate refresh
    const isReceiptEvent = eventName === 'receipt-scanned' || detail.action === 'receipt-scan';
    const timeout = isReceiptEvent ? 100 : 200; // Faster refresh for receipt events
    
    // Set a short timeout to batch potential multiple events
    refreshTimerRef.current = window.setTimeout(() => {
      console.log(`Refreshing expense list from ${eventName} event`);
      setRefreshTrigger(prev => prev + 1);
      setLastRefreshTime(Date.now());
      refreshTimerRef.current = null;
      
      // Show toast for certain events (but not for receipt events as they have their own toast)
      if (eventName === 'expense-added' && !isReceiptEvent) {
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
      
      // Clear any pending timeout
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [handleExpenseUpdateEvent]);
  
  return { refreshTrigger, triggerRefresh };
}
