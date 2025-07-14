import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import { useMonthContext } from './use-month-context';

/**
 * Optimized data sync hook that reduces redundant fetches and improves mobile performance
 */
export function useOptimizedDataSync() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { selectedMonth } = useMonthContext();
  const monthKey = format(selectedMonth, 'yyyy-MM');
  
  // Track last sync times to prevent excessive refreshes
  const [lastSyncTimes, setLastSyncTimes] = useState<Record<string, number>>({});
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Optimized refresh function with deduplication
  const refreshData = useCallback(async (dataType: string, force = false) => {
    if (!user?.id || syncInProgress) return;
    
    const now = Date.now();
    const lastSync = lastSyncTimes[dataType] || 0;
    const timeSinceLastSync = now - lastSync;
    
    // Prevent rapid successive refreshes (minimum 1 second gap)
    if (!force && timeSinceLastSync < 1000) {
      console.log(`Skipping ${dataType} refresh - too recent (${timeSinceLastSync}ms ago)`);
      return;
    }
    
    setSyncInProgress(true);
    
    try {
      switch (dataType) {
        case 'expenses':
          // Only invalidate current month expenses
          await queryClient.invalidateQueries({ 
            queryKey: ['expenses', monthKey, user.id],
            exact: true
          });
          break;
          
        case 'budgets':
          await queryClient.invalidateQueries({ 
            queryKey: ['budgets', user.id],
            exact: true 
          });
          break;
          
        case 'income':
          await queryClient.invalidateQueries({ 
            queryKey: ['monthly_income', user.id, monthKey],
            exact: true
          });
          break;
          
        case 'wallet':
          await queryClient.invalidateQueries({ 
            queryKey: ['wallet-additions', user.id],
            exact: true
          });
          break;
          
        case 'goals':
          await queryClient.invalidateQueries({ 
            queryKey: ['goals', user.id],
            exact: true
          });
          break;
          
        case 'all':
          // Full refresh - use sparingly
          await queryClient.invalidateQueries();
          break;
      }
      
      // Update last sync time
      setLastSyncTimes(prev => ({
        ...prev,
        [dataType]: now
      }));
      
      console.log(`Successfully refreshed ${dataType} data`);
    } catch (error) {
      console.error(`Error refreshing ${dataType} data:`, error);
    } finally {
      setSyncInProgress(false);
    }
  }, [user?.id, monthKey, queryClient, lastSyncTimes, syncInProgress]);

  // Debounced event handler
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    
    const handleDataEvent = (event: Event) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      
      debounceTimer = setTimeout(() => {
        const eventType = event.type;
        
        // Map events to data types
        if (eventType.includes('expense')) {
          refreshData('expenses');
        } else if (eventType.includes('budget')) {
          refreshData('budgets');
        } else if (eventType.includes('income')) {
          refreshData('income');
        } else if (eventType.includes('wallet')) {
          refreshData('wallet');
        } else if (eventType.includes('goal')) {
          refreshData('goals');
        }
      }, 300); // 300ms debounce
    };

    // Minimal essential events only
    const events = [
      'expense-added',
      'expense-updated', 
      'expense-deleted',
      'budget-updated',
      'income-updated',
      'wallet-updated',
      'goal-updated'
    ];

    events.forEach(event => {
      window.addEventListener(event, handleDataEvent);
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      events.forEach(event => {
        window.removeEventListener(event, handleDataEvent);
      });
    };
  }, [refreshData]);

  // Expose manual refresh functions
  return {
    refreshExpenses: () => refreshData('expenses', true),
    refreshBudgets: () => refreshData('budgets', true),
    refreshIncome: () => refreshData('income', true),
    refreshWallet: () => refreshData('wallet', true),
    refreshGoals: () => refreshData('goals', true),
    refreshAll: () => refreshData('all', true),
    syncInProgress,
    triggerEvent: (eventType: string, data?: any) => {
      window.dispatchEvent(new CustomEvent(eventType, { detail: data }));
    }
  };
}