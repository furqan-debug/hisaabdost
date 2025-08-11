import { useState, useEffect } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isOnline: navigator.onLine,
    registration: null,
    updateAvailable: false,
  });

  useEffect(() => {
    if (!state.isSupported) return;

    const registerSW = async () => {
      try {
        console.log('Registering service worker...');
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        setState(prev => ({ 
          ...prev, 
          isRegistered: true, 
          registration 
        }));

        console.log('Service Worker registered successfully');

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, updateAvailable: true }));
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('Message from SW:', event.data);
          
          if (event.data.type === 'EXPENSES_SYNCED') {
            window.dispatchEvent(new CustomEvent('expenses-synced'));
          } else if (event.data.type === 'BUDGETS_SYNCED') {
            window.dispatchEvent(new CustomEvent('budgets-synced'));
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerSW();

    // Listen for online/offline events
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.isSupported]);

  const updateApp = async () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const scheduleBackgroundSync = (tag: string) => {
    if ('serviceWorker' in navigator && state.registration) {
      // Check if Background Sync is supported
      if ('sync' in (window as any).ServiceWorkerRegistration.prototype) {
        (state.registration as any).sync.register(tag).catch((err: Error) => {
          console.warn('Background sync registration failed:', err);
        });
      } else {
        console.warn('Background Sync is not supported in this browser');
      }
    }
  };

  return {
    ...state,
    updateApp,
    scheduleBackgroundSync,
  };
}