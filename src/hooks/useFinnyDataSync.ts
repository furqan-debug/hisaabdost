
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
    // Listen for various Finny action events
    const handleDataRefresh = (event: CustomEvent) => {
      const { detail } = event;
      console.log('Finny data refresh event:', event.type, detail);

      // Invalidate relevant queries based on event type
      switch (event.type) {
        case 'expense-added':
        case 'expense-updated':
        case 'expense-deleted':
          queryClient.invalidateQueries({ queryKey: ['expenses'] });
          queryClient.invalidateQueries({ queryKey: ['all_expenses'] });
          break;

        case 'budget-added':
        case 'budget-updated':
        case 'budget-deleted':
          queryClient.invalidateQueries({ queryKey: ['budgets'] });
          break;

        case 'income-updated':
          queryClient.invalidateQueries({ queryKey: ['monthly_income'] });
          break;

        case 'goal-added':
        case 'goal-updated':
        case 'goal-deleted':
          queryClient.invalidateQueries({ queryKey: ['goals'] });
          break;

        case 'wallet-updated':
          queryClient.invalidateQueries({ queryKey: ['wallet_additions'] });
          break;

        default:
          // General refresh for unknown events
          queryClient.invalidateQueries();
          break;
      }

      // Force a small delay to ensure data is committed
      setTimeout(() => {
        queryClient.refetchQueries({ 
          queryKey: ['expenses', monthKey, user?.id] 
        });
        queryClient.refetchQueries({ 
          queryKey: ['budgets', monthKey, user?.id] 
        });
        queryClient.refetchQueries({ 
          queryKey: ['monthly_income', user?.id, monthKey] 
        });
      }, 100);
    };

    // Register event listeners
    const eventTypes = [
      'expense-added',
      'expense-updated', 
      'expense-deleted',
      'budget-added',
      'budget-updated',
      'budget-deleted',
      'income-updated',
      'goal-added',
      'goal-updated',
      'goal-deleted',
      'wallet-updated'
    ];

    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleDataRefresh as EventListener);
    });

    return () => {
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleDataRefresh as EventListener);
      });
    };
  }, [queryClient, user?.id, monthKey]);

  // Function to manually trigger refresh
  const triggerRefresh = (eventType: string, data?: any) => {
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
  };

  return { triggerRefresh };
}
