
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
    if (now - lastRefreshTime > 100) { // Reduced throttle time for more responsive updates
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
    const timeout = isFinnyEvent ? 10 : 50; // Very fast refresh for Finny events
    
    // Set a short timeout to batch potential multiple events
    refreshTimerRef.current = window.setTimeout(() => {
      console.log(`Refreshing expense list from ${eventName} event`);
      setRefreshTrigger(prev => prev + 1);
      setLastRefreshTime(Date.now());
      refreshTimerRef.current = null;
      
      // Show toast for Finny events
      if (isFinnyEvent) {
        if (eventName === 'expense-added' || eventName === 'finny-expense-added') {
          toast.success("Expense added via Finny!");
        } else if (eventName === 'expense-edited') {
          toast.success("Expense updated via Finny!");
        } else if (eventName === 'expense-deleted') {
          toast.success("Expense deleted via Finny!");
        } else if (eventName === 'wallet-updated') {
          toast.success("Wallet updated via Finny!");
        } else if (eventName === 'income-updated') {
          toast.success("Income updated via Finny!");
        }
      }
    }, timeout);
  }, []);
  
  useEffect(() => {
    // Listen for all expense-related events
    console.log("Setting up expense refresh event listeners");
    
    // Add event listeners for various expense update events
    const eventTypes = [
      'expenses-updated',
      'receipt-scanned',
      'expense-added',
      'expense-edited',
      'expense-deleted',
      'expense-refresh',
      'custom-date-change',
      'finny-expense-added',
      'wallet-updated',
      'wallet-refresh',
      'income-updated',
      'income-refresh'
    ];
    
    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleExpenseUpdateEvent);
    });
    
    // Cleanup listeners on unmount
    return () => {
      console.log("Removing expense refresh event listeners");
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleExpenseUpdateEvent);
      });
      
      // Clear any pending timeout
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [handleExpenseUpdateEvent]);
  
  return { refreshTrigger, triggerRefresh };
}
