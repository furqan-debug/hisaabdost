
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

      // Invalidate and refetch relevant queries immediately
      const invalidateAndRefetch = async () => {
        switch (event.type) {
          case 'expense-added':
          case 'expense-updated':
          case 'expense-deleted':
          case 'finny-expense-added':
            await queryClient.invalidateQueries({ queryKey: ['expenses'] });
            await queryClient.invalidateQueries({ queryKey: ['all_expenses'] });
            // Force immediate refetch
            await queryClient.refetchQueries({ 
              queryKey: ['expenses', monthKey, user?.id] 
            });
            await queryClient.refetchQueries({ 
              queryKey: ['all_expenses', user?.id] 
            });
            break;

          case 'budget-added':
          case 'budget-updated':
          case 'budget-deleted':
            await queryClient.invalidateQueries({ queryKey: ['budgets'] });
            await queryClient.refetchQueries({ 
              queryKey: ['budgets', monthKey, user?.id] 
            });
            break;

          case 'income-updated':
            await queryClient.invalidateQueries({ queryKey: ['monthly_income'] });
            await queryClient.refetchQueries({ 
              queryKey: ['monthly_income', user?.id, monthKey] 
            });
            break;

          case 'goal-added':
          case 'goal-updated':
          case 'goal-deleted':
            await queryClient.invalidateQueries({ queryKey: ['goals'] });
            await queryClient.refetchQueries({ 
              queryKey: ['goals', user?.id] 
            });
            break;

          case 'wallet-updated':
            await queryClient.invalidateQueries({ queryKey: ['wallet_additions'] });
            await queryClient.refetchQueries({ 
              queryKey: ['wallet_additions', user?.id] 
            });
            break;

          default:
            // General refresh for unknown events
            await queryClient.invalidateQueries();
            break;
        }
      };

      // Execute immediately and with retries
      invalidateAndRefetch();
      setTimeout(invalidateAndRefetch, 500);
      setTimeout(invalidateAndRefetch, 1500);
    };

    // Register event listeners for all relevant events
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
      'dashboard-refresh'
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
