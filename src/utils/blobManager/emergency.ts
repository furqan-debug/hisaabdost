
/**
 * Emergency blob URL cleanup mechanisms
 */

import { forceCleanupAllBlobUrls } from './cleanup';

/**
 * Add a global emergency cleanup mechanism
 * This can be triggered if the app detects it's frozen
 */
export function registerEmergencyCleanup(): void {
  // Add an emergency cleanup listener with a timeout
  let uiBlockedTimeout: number | null = null;
  
  // Add event listeners to detect UI activity
  const resetTimeout = () => {
    if (uiBlockedTimeout) {
      clearTimeout(uiBlockedTimeout);
      uiBlockedTimeout = null;
    }
  };
  
  // Listen for user interaction events
  document.addEventListener('click', resetTimeout);
  document.addEventListener('mousemove', resetTimeout);
  document.addEventListener('keydown', resetTimeout);
  
  // Add a listener to detect if the dialog is stuck
  document.addEventListener('dialogClosed', resetTimeout);
  
  // Add global error handler to catch dialog errors
  window.addEventListener('error', (event) => {
    if (event.message.includes('dialog') || event.message.includes('blob')) {
      console.error("Dialog or blob related error detected:", event.message);
      forceCleanupAllBlobUrls();
    }
  });
}

// Initialize the emergency cleanup mechanism
setTimeout(() => {
  registerEmergencyCleanup();
}, 1000);
