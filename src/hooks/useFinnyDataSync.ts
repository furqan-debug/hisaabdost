
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
    // Debounced refresh function to prevent excessive invalidations
    let debounceTimer: NodeJS.Timeout;
    
    const handleDataRefresh = async (event: CustomEvent) => {
      const { detail } = event;
      console.log('Finny data refresh event:', event.type, detail);

      // Clear existing debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Check if this is a Finny event
      const isFinnyEvent = detail?.source === 'finny-chat';

      // Debounce invalidations to prevent spam - shorter debounce for Finny events
      debounceTimer = setTimeout(async () => {
        switch (event.type) {
          case 'expense-added':
          case 'expense-updated':
          case 'expense-deleted':
          case 'finny-expense-added':
            console.log('Processing expense event');
            
            if (user?.id) {
              // Only invalidate specific expense queries
              await queryClient.invalidateQueries({ 
                queryKey: ['expenses', user.id] 
              });
              
              if (isFinnyEvent) {
                // Force immediate refetch for Finny events only
                await queryClient.refetchQueries({ 
                  queryKey: ['expenses', user.id] 
                });
              }
            }
            break;

          case 'budget-added':
          case 'budget-updated':
          case 'budget-deleted':
          case 'set_budget':
          case 'update_budget':
            console.log('Processing budget event');
            if (user?.id) {
              await queryClient.invalidateQueries({ 
                queryKey: ['budgets', user.id] 
              });
            }
            break;

          case 'income-updated':
            if (user?.id) {
              await queryClient.invalidateQueries({ 
                queryKey: ['monthly_income', user.id] 
              });
            }
            break;

        case 'wallet-updated':
        case 'wallet-refresh':
          console.log('Processing wallet event');
          if (user?.id) {
            // Invalidate all wallet-related queries
            await queryClient.invalidateQueries({ 
              queryKey: ['wallet-additions', user.id] 
            });
            await queryClient.invalidateQueries({ 
              queryKey: ['wallet-additions-all', user.id] 
            });
            await queryClient.invalidateQueries({ 
              queryKey: ['dashboard-data', user.id] 
            });
            await queryClient.invalidateQueries({ 
              queryKey: ['monthly-data', user.id] 
            });
            await queryClient.invalidateQueries({ 
              queryKey: ['activity_logs', user.id] 
            });
            
            if (isFinnyEvent) {
              // Force immediate refetch for Finny events
              await queryClient.refetchQueries({ 
                queryKey: ['wallet-additions', user.id] 
              });
              await queryClient.refetchQueries({ 
                queryKey: ['wallet-additions-all', user.id] 
              });
              await queryClient.refetchQueries({ 
                queryKey: ['dashboard-data', user.id] 
              });
              await queryClient.refetchQueries({ 
                queryKey: ['monthly-data', user.id] 
              });
              await queryClient.refetchQueries({ 
                queryKey: ['activity_logs', user.id] 
              });
            }
          }
          break;

          case 'goal-added':
          case 'goal-updated':
          case 'goal-deleted':
            if (user?.id) {
              await queryClient.invalidateQueries({ 
                queryKey: ['goals', user.id] 
              });
            }
            break;

          default:
            // For unknown events, only invalidate if it's a Finny event
            if (isFinnyEvent) {
              await queryClient.invalidateQueries();
            }
            break;
        }
      }, isFinnyEvent ? 100 : 500);
    };

    // Reduced number of event listeners
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
      'wallet-refresh'
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
    console.log('Manually triggering refresh:', eventType, data);
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
  };

  return { triggerRefresh };
}
