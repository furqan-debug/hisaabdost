
import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook to listen for expense update events
 * and trigger refreshes in the expense list
 */
export function useExpenseRefresh() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  
  const triggerRefresh = useCallback(() => {
    // Manual refresh for user-initiated actions
    console.log("Manually triggering refresh");
    setRefreshTrigger(prev => prev + 1);
    setLastRefreshTime(Date.now());
  }, []);
  
  // Simplified event handling - only for toast notifications, not query refreshing
  useEffect(() => {
    const handleFinnyEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail || {};
      
      // Only show toast notifications for Finny events, don't trigger refreshes
      if (detail.source === 'finny-chat') {
        const eventName = event.type;
        console.log(`Finny ${eventName} event - showing toast only`);
        
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
    };
    
    // Only listen to Finny events for toast notifications
    const finnyEventTypes = [
      'finny-expense-added',
      'wallet-updated',
      'income-updated'
    ];
    
    finnyEventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleFinnyEvent);
    });
    
    return () => {
      finnyEventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleFinnyEvent);
      });
    };
  }, []);
  
  return { refreshTrigger, triggerRefresh };
}
