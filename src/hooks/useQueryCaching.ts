import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Enhanced query caching for offline-first architecture
 */
export function useQueryCaching() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch critical data when the app starts
    const prefetchCriticalData = async () => {
      try {
        // Prefetch budget data
        await queryClient.prefetchQuery({
          queryKey: ['budgets'],
          staleTime: 1000 * 60 * 30, // 30 minutes
        });

        // Prefetch current month expenses
        const currentMonth = new Date().toISOString().slice(0, 7);
        await queryClient.prefetchQuery({
          queryKey: ['expenses', currentMonth],
          staleTime: 1000 * 60 * 5, // 5 minutes
        });

        // Prefetch wallet data
        await queryClient.prefetchQuery({
          queryKey: ['wallet-additions'],
          staleTime: 1000 * 60 * 5,
        });
      } catch (error) {
        console.log('Prefetch failed, but app will work normally');
      }
    };

    // Prefetch when online
    if (navigator.onLine) {
      prefetchCriticalData();
    }

    // Set up cache persistence for offline use
    const persistCache = () => {
      try {
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();
        
        // Store critical queries in localStorage for offline access
        const criticalQueries = queries.filter(query => {
          const key = query.queryKey[0] as string;
          return ['budgets', 'expenses', 'wallet-additions', 'monthly_income'].includes(key);
        });

        criticalQueries.forEach(query => {
          if (query.state.data) {
            localStorage.setItem(
              `cache_${query.queryHash}`,
              JSON.stringify({
                data: query.state.data,
                timestamp: Date.now(),
                queryKey: query.queryKey
              })
            );
          }
        });
      } catch (error) {
        console.warn('Cache persistence failed:', error);
      }
    };

    // Persist cache on page unload
    window.addEventListener('beforeunload', persistCache);

    // Restore cache from localStorage
    const restoreCache = () => {
      try {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
        
        keys.forEach(key => {
          try {
            const stored = JSON.parse(localStorage.getItem(key) || '{}');
            const age = Date.now() - stored.timestamp;
            
            // Only restore if less than 1 hour old
            if (age < 60 * 60 * 1000 && stored.data && stored.queryKey) {
              queryClient.setQueryData(stored.queryKey, stored.data);
            } else {
              // Clean up old cache
              localStorage.removeItem(key);
            }
          } catch (e) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Cache restoration failed:', error);
      }
    };

    // Restore on initial load
    restoreCache();

    return () => {
      window.removeEventListener('beforeunload', persistCache);
    };
  }, [queryClient]);

  // Manual cache management functions
  const clearOldCache = () => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    keys.forEach(key => {
      try {
        const stored = JSON.parse(localStorage.getItem(key) || '{}');
        if (stored.timestamp < oneHourAgo) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        localStorage.removeItem(key);
      }
    });
  };

  const getStorageUsage = () => {
    try {
      const used = new Blob(Object.values(localStorage)).size;
      const available = 5 * 1024 * 1024; // Assume 5MB limit
      return { used, available, percentage: (used / available) * 100 };
    } catch {
      return { used: 0, available: 0, percentage: 0 };
    }
  };

  return {
    clearOldCache,
    getStorageUsage,
  };
}