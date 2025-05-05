
import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const supabaseUrl = 'https://bklfolfivjonzpprytkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrbGZvbGZpdmpvbnpwcHJ5dGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMjM0NjQsImV4cCI6MjA1NTg5OTQ2NH0.oipdwmQ4lRIyeYX00Irz4q0ZEDlKc9wuQhSPbHRzOKE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: false,
    autoRefreshToken: true,
    // Disable storage event listeners for better performance
    storageKey: 'supabase.auth.token',
  },
  global: {
    // Set higher timeout for mobile networks
    fetch: (...args) => {
      // @ts-ignore - We know args has the right structure
      const [url, options = {}] = args;
      options.headers = {
        ...options.headers,
        'Pragma': 'no-cache',
      };
      // Default timeout of 30 seconds
      return fetch(url, {
        ...options,
        signal: options.signal || (AbortSignal.timeout ? AbortSignal.timeout(30000) : undefined),
      });
    },
  },
  // Enable local cache for non-auth requests
  db: {
    schema: 'public',
  },
  realtime: {
    // Disable realtime subscriptions by default for better initial loading
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Helper for eager auth state detection
export async function preloadAuthState() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user || null;
  } catch (error) {
    console.error('Failed to preload auth state:', error);
    return null;
  }
}

// Setup a local IndexedDB cache for frequently used queries
export const initializeLocalCache = async () => {
  // Implementation would go here if we wanted to use a third-party library
  // For now, we'll use localStorage for simplicity
  
  return {
    getCache: (key: string) => {
      try {
        const cached = localStorage.getItem(`hisaabdost_cache:${key}`);
        if (!cached) return null;
        
        const { data, expiry } = JSON.parse(cached);
        if (Date.now() > expiry) {
          localStorage.removeItem(`hisaabdost_cache:${key}`);
          return null;
        }
        
        return data;
      } catch (e) {
        return null;
      }
    },
    setCache: (key: string, data: any, ttlSeconds = 300) => {
      try {
        const cache = {
          data,
          expiry: Date.now() + (ttlSeconds * 1000)
        };
        localStorage.setItem(`hisaabdost_cache:${key}`, JSON.stringify(cache));
      } catch (e) {
        console.error('Cache storage failed:', e);
      }
    }
  };
};

export const cacheLayer = {
  instance: null as any,
  
  // Initialize cache
  init: async () => {
    if (!cacheLayer.instance) {
      cacheLayer.instance = await initializeLocalCache();
    }
    return cacheLayer.instance;
  },
  
  // Get value with cache
  get: async (key: string) => {
    await cacheLayer.init();
    return cacheLayer.instance.getCache(key);
  },
  
  // Set value with cache
  set: async (key: string, data: any, ttlSeconds = 300) => {
    await cacheLayer.init();
    return cacheLayer.instance.setCache(key, data, ttlSeconds);
  }
};
