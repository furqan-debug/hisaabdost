
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
    const handleDataRefresh = async (event: CustomEvent) => {
      const { detail } = event;
      console.log('Finny data refresh event:', event.type, detail);

      // Force immediate invalidation and refetch for all expense-related queries
      const invalidateAndRefetch = async () => {
        switch (event.type) {
          case 'expense-added':
          case 'expense-updated':
          case 'expense-deleted':
          case 'finny-expense-added':
            console.log('Processing expense event, invalidating all expense queries');
            
            // Invalidate all possible expense query variations
            await queryClient.invalidateQueries({ queryKey: ['expenses'] });
            await queryClient.invalidateQueries({ queryKey: ['all_expenses'] });
            await queryClient.invalidateQueries({ queryKey: ['all-expenses'] });
            
            // Force immediate refetch with current user and month data
            if (user?.id) {
              await queryClient.refetchQueries({ 
                queryKey: ['expenses', monthKey, user.id] 
              });
              await queryClient.refetchQueries({ 
                queryKey: ['all_expenses', user.id] 
              });
              await queryClient.refetchQueries({ 
                queryKey: ['all-expenses', user.id] 
              });
              
              // CRITICAL: Also invalidate analytics queries that use dateRange format
              console.log('Invalidating analytics queries for expense changes');
              await queryClient.invalidateQueries({ 
                queryKey: ['expenses'], 
                predicate: (query) => {
                  // Invalidate any expenses query that includes user.id
                  return query.queryKey.includes(user.id);
                }
              });
            }
            break;

          case 'budget-added':
          case 'budget-updated':
          case 'budget-deleted':
          case 'set_budget':
          case 'update_budget':
            console.log('Processing budget event, invalidating all budget queries');
            await queryClient.invalidateQueries({ queryKey: ['budgets'] });
            if (user?.id) {
              await queryClient.refetchQueries({ 
                queryKey: ['budgets', monthKey, user.id] 
              });
              // Also refetch without monthKey for budget page
              await queryClient.refetchQueries({ 
                queryKey: ['budgets', user.id] 
              });
            }
            break;

          case 'income-updated':
            await queryClient.invalidateQueries({ queryKey: ['monthly_income'] });
            if (user?.id) {
              await queryClient.refetchQueries({ 
                queryKey: ['monthly_income', user.id, monthKey] 
              });
            }
            break;

          case 'goal-added':
          case 'goal-updated':
          case 'goal-deleted':
            await queryClient.invalidateQueries({ queryKey: ['goals'] });
            if (user?.id) {
              await queryClient.refetchQueries({ 
                queryKey: ['goals', user.id] 
              });
            }
            break;

          case 'wallet-updated':
            await queryClient.invalidateQueries({ queryKey: ['wallet_additions'] });
            if (user?.id) {
              await queryClient.refetchQueries({ 
                queryKey: ['wallet_additions', user.id] 
              });
            }
            break;

          case 'dashboard-refresh':
          case 'analytics-refresh':
            // Refresh everything for dashboard and analytics
            await queryClient.invalidateQueries();
            break;

          default:
            // General refresh for unknown events
            await queryClient.invalidateQueries();
            break;
        }
      };

      // Execute immediately
      await invalidateAndRefetch();
      
      // Additional delayed refreshes to ensure data consistency
      setTimeout(async () => {
        console.log('Secondary refresh for', event.type);
        await invalidateAndRefetch();
      }, 100);
      
      // Final refresh after 1 second for Finny actions (reduced from 2s)
      if (detail?.source === 'finny-chat') {
        setTimeout(async () => {
          console.log('Final Finny refresh for', event.type);
          await invalidateAndRefetch();
        }, 1000);
      }
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
      'set_budget',
      'update_budget',
      'income-updated',
      'goal-added',
      'goal-updated',
      'goal-deleted',
      'wallet-updated',
      'dashboard-refresh',
      'analytics-refresh'
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
    console.log('Manually triggering refresh:', eventType, data);
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
  };

  return { triggerRefresh };
}
