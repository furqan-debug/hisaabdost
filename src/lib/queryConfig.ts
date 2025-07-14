/**
 * Centralized query configuration for optimal mobile performance
 * These settings are optimized for mobile devices with slower networks
 */
export const QUERY_CONFIG = {
  // Standard cache times for different data types
  STALE_TIME: {
    // Frequently changing data
    EXPENSES: 1000 * 60 * 2,      // 2 minutes
    BUDGETS: 1000 * 60 * 2,       // 2 minutes  
    INCOME: 1000 * 60 * 2,        // 2 minutes
    WALLET: 1000 * 60 * 2,        // 2 minutes
    
    // Moderately changing data
    GOALS: 1000 * 60 * 5,         // 5 minutes
    PROFILE: 1000 * 60 * 10,      // 10 minutes
    
    // Rarely changing data  
    SETTINGS: 1000 * 60 * 15,     // 15 minutes
    TIPS: 1000 * 60 * 30,         // 30 minutes
  },
  
  // Garbage collection times (how long to keep in cache after stale)
  GC_TIME: {
    DEFAULT: 1000 * 60 * 10,      // 10 minutes
    LONG: 1000 * 60 * 30,         // 30 minutes
  },
  
  // Default query options for mobile optimization
  DEFAULT_OPTIONS: {
    refetchOnMount: false,        // Only fetch if data is stale
    refetchOnWindowFocus: false,  // Don't refetch on focus (mobile battery)
    refetchOnReconnect: true,     // Do refetch when connection restored
    retry: 2,                     // Limit retries on mobile
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  
  // Network-aware settings
  MOBILE_OPTIMIZED: {
    staleTime: 1000 * 60 * 3,     // Longer stale time for mobile
    refetchInterval: false,       // Disable background refetching
    refetchIntervalInBackground: false,
  }
} as const;

/**
 * Get optimized query options for a specific data type
 */
export function getQueryOptions(dataType: keyof typeof QUERY_CONFIG.STALE_TIME) {
  return {
    ...QUERY_CONFIG.DEFAULT_OPTIONS,
    staleTime: QUERY_CONFIG.STALE_TIME[dataType],
    gcTime: QUERY_CONFIG.GC_TIME.DEFAULT,
  };
}

/**
 * Check if we're on a slow connection and apply stricter caching
 */
export function getMobileOptimizedOptions(dataType: keyof typeof QUERY_CONFIG.STALE_TIME) {
  // In a real app, you could check navigator.connection.effectiveType
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    return {
      ...getQueryOptions(dataType),
      ...QUERY_CONFIG.MOBILE_OPTIMIZED,
    };
  }
  
  return getQueryOptions(dataType);
}
