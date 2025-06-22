
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
    // Immediate refresh for manual triggers
    console.log("Manually triggering refresh");
    setRefreshTrigger(prev => prev + 1);
    setLastRefreshTime(Date.now());
  }, []);
  
  // Function to handle various expense update events
  const handleExpenseUpdateEvent = useCallback((event: Event) => {
    const eventName = event.type;
    const customEvent = event as CustomEvent;
    const detail = customEvent.detail || {};
    
    console.log(`${eventName} event received, triggering IMMEDIATE refresh`, detail);
    
    // Clear any existing timer
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
    }
    
    // Immediate refresh for all Finny events
    const isFinnyEvent = detail.source === 'finny-chat';
    
    if (isFinnyEvent) {
      console.log(`IMMEDIATE refresh for Finny ${eventName} event`);
      // Trigger immediate refresh
      setRefreshTrigger(prev => prev + 1);
      setLastRefreshTime(Date.now());
      
      // Show toast for Finny events
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
      
      // Also trigger a delayed refresh to ensure data is fully updated
      refreshTimerRef.current = window.setTimeout(() => {
        console.log(`Secondary refresh for ${eventName} event`);
        setRefreshTrigger(prev => prev + 1);
        refreshTimerRef.current = null;
      }, 500);
    } else {
      // For non-Finny events, use a short delay
      refreshTimerRef.current = window.setTimeout(() => {
        console.log(`Delayed refresh for ${eventName} event`);
        setRefreshTrigger(prev => prev + 1);
        setLastRefreshTime(Date.now());
        refreshTimerRef.current = null;
      }, 100);
    }
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
      'income-refresh',
      'budget-updated',
      'budget-refresh'
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
