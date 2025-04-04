
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
    
    // Listen for the custom event
    window.addEventListener('force-query-invalidation', handleForceInvalidation);
    
    // Cleanup function
    return () => {
      window.removeEventListener('force-query-invalidation', handleForceInvalidation);
    };
  }, [queryClient]);
}
