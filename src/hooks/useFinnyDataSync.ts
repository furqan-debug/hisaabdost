
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import { useMonthContext } from './use-month-context';

export function useFinnyDataSync() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { selectedMonth } = useMonthContext();
  const monthKey = format(selectedMonth, 'yyyy-MM');

  useEffect(() => {
    // Optimized refresh function with immediate updates for Finny events
    let debounceTimer: NodeJS.Timeout;
    
    const handleDataRefresh = async (event: CustomEvent) => {
      const { detail } = event;
      console.log('🔄 Finny data refresh event received:', event.type, detail);

      // Clear existing debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Check if this is a Finny event for immediate processing
      const isFinnyEvent = detail?.source === 'finny-chat' || detail?.source === 'finny';
      const isFinnyAdvancedEvent = event.type === 'finny-advanced-action';

      // For Finny events, process immediately without debounce
      if (isFinnyEvent || isFinnyAdvancedEvent) {
        console.log('🚀 IMMEDIATE Finny event processing');
        await processEventImmediately(event.type, isFinnyEvent || isFinnyAdvancedEvent);
      }

      // Still use debounce for non-critical updates
      const debounceDelay = (isFinnyEvent || isFinnyAdvancedEvent) ? 50 : 500;
      
      debounceTimer = setTimeout(async () => {
        await processEventImmediately(event.type, isFinnyEvent || isFinnyAdvancedEvent);
      }, debounceDelay);
    };

    const processEventImmediately = async (eventType: string, isFinnyEvent: boolean) => {
      if (!user?.id) return;

      switch (eventType) {
        case 'expense-added':
        case 'expense-updated':
        case 'expense-deleted':
        case 'finny-expense-added':
          console.log('🔄 Processing expense event');
          await queryClient.invalidateQueries({ queryKey: ['expenses', user.id] });
          if (isFinnyEvent) {
            queryClient.refetchQueries({ queryKey: ['expenses', user.id] });
          }
          break;

        case 'budget-added':
        case 'budget-updated':
        case 'budget-deleted':
        case 'set_budget':
        case 'update_budget':
          console.log('🔄 Processing budget event');
          await queryClient.invalidateQueries({ queryKey: ['budgets', user.id] });
          break;

        case 'income-updated':
          console.log('🔄 Processing income event');
          await queryClient.invalidateQueries({ queryKey: ['monthly_income', user.id] });
          break;

        case 'wallet-updated':
        case 'wallet-refresh':
        case 'finny-advanced-action':
          console.log('🔄 Processing wallet/Finny advanced event');
          
          // Invalidate all wallet-related queries
          await queryClient.invalidateQueries({ queryKey: ['wallet-additions', user.id] });
          await queryClient.invalidateQueries({ queryKey: ['wallet-additions-all', user.id] });
          await queryClient.invalidateQueries({ queryKey: ['wallet-additions'] });
          await queryClient.invalidateQueries({ queryKey: ['wallet-additions-all'] });
          
          // Also invalidate activity logs for Monthly Summary page
          await queryClient.invalidateQueries({ queryKey: ['activity_logs', user.id] });
          
          // Force immediate refetch for Finny events
          if (isFinnyEvent) {
            console.log('🚀 Force refetching wallet queries for Finny event');
            queryClient.refetchQueries({ queryKey: ['wallet-additions', user.id] });
            queryClient.refetchQueries({ queryKey: ['wallet-additions-all', user.id] });
            queryClient.refetchQueries({ queryKey: ['wallet-additions'] });
            queryClient.refetchQueries({ queryKey: ['wallet-additions-all'] });
            queryClient.refetchQueries({ queryKey: ['activity_logs', user.id] });
            
            // Additional refresh after short delay
            setTimeout(() => {
              console.log('🔄 Secondary wallet refresh for Finny');
              queryClient.refetchQueries({ queryKey: ['activity_logs', user.id] });
            }, 200);
          }
          break;

        case 'goal-added':
        case 'goal-updated':
        case 'goal-deleted':
          console.log('🔄 Processing goal event');
          await queryClient.invalidateQueries({ queryKey: ['goals', user.id] });
          break;

        default:
          // For unknown Finny events, invalidate all relevant queries
          if (isFinnyEvent) {
            console.log('🔄 Processing unknown Finny event - refreshing all');
            await queryClient.invalidateQueries({ queryKey: ['wallet-additions'] });
            await queryClient.invalidateQueries({ queryKey: ['activity_logs'] });
            await queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.refetchQueries({ queryKey: ['wallet-additions'] });
            queryClient.refetchQueries({ queryKey: ['activity_logs'] });
          }
          break;
      }
    };

    // Listen to comprehensive list of events
    const eventTypes = [
      'expense-added',
      'expense-updated', 
      'expense-deleted',
      'finny-expense-added',
      'budget-added',
      'budget-updated',
      'budget-deleted',
      'income-updated',
      'goal-added',
      'goal-updated',
      'goal-deleted',
      'wallet-updated',
      'wallet-refresh',
      'finny-advanced-action'
    ];

    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleDataRefresh as EventListener);
    });

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleDataRefresh as EventListener);
      });
    };
  }, [queryClient, user?.id, monthKey]);

  // Function to manually trigger refresh
  const triggerRefresh = (eventType: string, data?: any) => {
    console.log('🔄 Manually triggering refresh:', eventType, data);
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
  };

  return { triggerRefresh };
}
