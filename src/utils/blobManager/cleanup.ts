
/**
 * Blob URL cleanup utilities
 */

import { 
  getBlobUrlReferences, 
  getLastCleanupTime, 
  setLastCleanupTime,
  resetBlobUrlTracking 
} from './core';

// Add a global emergency flag to prevent freezing
let emergencyCleanupInProgress = false;

/**
 * Cleanup all blob URLs (useful when component unmounts)
 */
export function cleanupAllBlobUrls(): void {
  // Prevent too frequent cleanups
  const now = Date.now();
  if (now - getLastCleanupTime() < 2000) {
    console.log(`Skipping cleanup, last cleanup was ${now - getLastCleanupTime()}ms ago`);
    return;
  }
  
  setLastCleanupTime(now);
  const blobUrlReferences = getBlobUrlReferences();
  console.log(`Cleaning all blob URLs. Total tracked: ${blobUrlReferences.size}`);
  
  blobUrlReferences.forEach((count, url) => {
    try {
      URL.revokeObjectURL(url);
      console.log(`Revoked blob URL during cleanup: ${url}`);
    } catch (error) {
      console.error(`Error revoking blob URL during cleanup: ${url}`, error);
    }
  });
  
  blobUrlReferences.clear();
  console.log(`All blob URL references cleared.`);
}

/**
 * Clean up blob URLs that are no longer in use
 */
export function cleanupUnusedBlobUrls(): void {
  // Prevent too frequent cleanups
  const now = Date.now();
  if (now - getLastCleanupTime() < 1000) {
    console.log(`Skipping unused cleanup, last cleanup was ${now - getLastCleanupTime()}ms ago`);
    return;
  }
  
  setLastCleanupTime(now);
  let cleanedCount = 0;
  const blobUrlReferences = getBlobUrlReferences();
  
  blobUrlReferences.forEach((count, url) => {
    if (count <= 0) {
      try {
        URL.revokeObjectURL(url);
        blobUrlReferences.delete(url);
        cleanedCount++;
        console.log(`Cleaned up unused blob URL: ${url}`);
      } catch (error) {
        console.error(`Error cleaning up unused blob URL: ${url}`, error);
      }
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} unused blob URLs. Remaining: ${blobUrlReferences.size}`);
  }
}

/**
 * Force cleanup all blob URLs and reset counters (emergency use only)
 */
export function forceCleanupAllBlobUrls(): void {
  // Prevent multiple emergency cleanups at the same time
  if (emergencyCleanupInProgress) {
    console.log("Emergency cleanup already in progress, skipping");
    return;
  }
  
  emergencyCleanupInProgress = true;
  
  try {
    // Fix: First create an array of string values
    const allUrls: string[] = [];
    
    // Fix: Type-safe approach to find blob URLs in the window object
    for (const key in window) {
      try {
        const value = window[key as keyof Window];
        if (typeof value === 'string' && value.startsWith('blob:')) {
          allUrls.push(value);
        }
      } catch (err) {
        // Ignore errors when accessing some window properties
      }
    }
    
    const blobUrlReferences = getBlobUrlReferences();
    console.warn(`Force cleaning ${allUrls.length} detected blob URLs and ${blobUrlReferences.size} tracked URLs`);
    
    // Clean tracked URLs
    blobUrlReferences.forEach((count, url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // Ignore errors
      }
    });
    
    // Clean all detected blob URLs
    allUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // Ignore errors
      }
    });
    
    // Reset tracking
    resetBlobUrlTracking();
    
    console.log("Force cleanup complete. All blob URL references and counters reset.");
  } catch (err) {
    console.error("Error during emergency cleanup:", err);
  } finally {
    // Reset emergency flag after a delay
    setTimeout(() => {
      emergencyCleanupInProgress = false;
    }, 1000);
  }
}
