
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook to listen for query invalidation events and invalidate queries accordingly
 */
export function useQueryInvalidation() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Event handler function
    const handleForceInvalidation = (event: Event) => {
      const customEvent = event as CustomEvent<{queryKeys: string[]}>;
      
      if (customEvent.detail && customEvent.detail.queryKeys) {
        console.log('Force invalidating queries:', customEvent.detail.queryKeys);
        
        customEvent.detail.queryKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
    };
    
    const handleReceiptScan = () => {
      console.log('Receipt scanned, invalidating expense queries');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['all-expenses'] });
    };
    
    const handleExpensesUpdated = () => {
      console.log('Expenses updated, invalidating expense queries');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['all-expenses'] });
    };
    
    // Listen for the custom events
    window.addEventListener('force-query-invalidation', handleForceInvalidation);
    window.addEventListener('receipt-scanned', handleReceiptScan);
    window.addEventListener('expenses-updated', handleExpensesUpdated);
    
    // Cleanup function
    return () => {
      window.removeEventListener('force-query-invalidation', handleForceInvalidation);
      window.removeEventListener('receipt-scanned', handleReceiptScan);
      window.removeEventListener('expenses-updated', handleExpensesUpdated);
    };
  }, [queryClient]);
}
