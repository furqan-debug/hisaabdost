/**
 * Utility to manage blob URLs to prevent memory leaks
 */

// Track references to blob URLs to prevent premature garbage collection
const blobUrlReferences = new Map<string, number>();

// Add debug tracking to find potential memory leaks
let totalCreated = 0;
let totalRevoked = 0;

// Keep track of the last cleanup time to avoid too frequent cleanups
let lastCleanupTime = 0;

// Add a global emergency flag to prevent freezing
let emergencyCleanupInProgress = false;

/**
 * Create a managed blob URL from a file
 */
export function createManagedBlobUrl(file: File | Blob): string {
  const url = URL.createObjectURL(file);
  addBlobUrlReference(url);
  totalCreated++;
  console.log(`Created managed blob URL: ${url} (Total created: ${totalCreated})`);
  return url;
}

/**
 * Add a reference to a blob URL to prevent garbage collection
 */
export function addBlobUrlReference(url: string): void {
  if (!url || !url.startsWith('blob:')) {
    console.warn(`Invalid URL provided to addBlobUrlReference: ${url}`);
    return;
  }
  
  const count = blobUrlReferences.get(url) || 0;
  blobUrlReferences.set(url, count + 1);
  console.log(`Added reference to blob URL: ${url}, count: ${count + 1}`);
}

/**
 * Mark a blob URL for cleanup when no more references exist
 */
export function markBlobUrlForCleanup(url: string): void {
  if (!url || !url.startsWith('blob:')) {
    console.warn(`Invalid URL provided to markBlobUrlForCleanup: ${url}`);
    return;
  }
  
  const count = blobUrlReferences.get(url) || 0;
  
  if (count <= 1) {
    // Last reference, clean up the URL, but with retry logic
    blobUrlReferences.delete(url);
    try {
      URL.revokeObjectURL(url);
      totalRevoked++;
      console.log(`Revoked blob URL: ${url} (Total revoked: ${totalRevoked})`);
    } catch (error) {
      console.error(`Error revoking blob URL: ${url}`, error);
      // Re-try once more after a short delay
      setTimeout(() => {
        try {
          URL.revokeObjectURL(url);
          totalRevoked++;
          console.log(`Revoked blob URL on retry: ${url} (Total revoked: ${totalRevoked})`);
        } catch (retryError) {
          console.error(`Failed to revoke blob URL on retry: ${url}`, retryError);
        }
      }, 500);
    }
  } else {
    // Decrement reference count
    blobUrlReferences.set(url, count - 1);
    console.log(`Decreased reference to blob URL: ${url}, count: ${count - 1}`);
  }
}

/**
 * Cleanup all blob URLs (useful when component unmounts)
 */
export function cleanupAllBlobUrls(): void {
  // Prevent too frequent cleanups
  const now = Date.now();
  if (now - lastCleanupTime < 2000) {
    console.log(`Skipping cleanup, last cleanup was ${now - lastCleanupTime}ms ago`);
    return;
  }
  
  lastCleanupTime = now;
  console.log(`Cleaning all blob URLs. Total tracked: ${blobUrlReferences.size}`);
  
  blobUrlReferences.forEach((count, url) => {
    try {
      URL.revokeObjectURL(url);
      totalRevoked++;
      console.log(`Revoked blob URL during cleanup: ${url}`);
    } catch (error) {
      console.error(`Error revoking blob URL during cleanup: ${url}`, error);
    }
  });
  
  blobUrlReferences.clear();
  console.log(`All blob URL references cleared. Created: ${totalCreated}, Revoked: ${totalRevoked}`);
}

/**
 * Clean up blob URLs that are no longer in use
 */
export function cleanupUnusedBlobUrls(): void {
  // Prevent too frequent cleanups
  const now = Date.now();
  if (now - lastCleanupTime < 1000) {
    console.log(`Skipping unused cleanup, last cleanup was ${now - lastCleanupTime}ms ago`);
    return;
  }
  
  lastCleanupTime = now;
  let cleanedCount = 0;
  
  blobUrlReferences.forEach((count, url) => {
    if (count <= 0) {
      try {
        URL.revokeObjectURL(url);
        blobUrlReferences.delete(url);
        totalRevoked++;
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
  
  // Print stats
  console.log(`Blob URL stats - Created: ${totalCreated}, Revoked: ${totalRevoked}, Active: ${blobUrlReferences.size}`);
}

/**
 * Get current blob URL stats for debugging
 */
export function getBlobUrlStats(): { created: number; revoked: number; active: number } {
  return {
    created: totalCreated,
    revoked: totalRevoked,
    active: blobUrlReferences.size
  };
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
    blobUrlReferences.clear();
    totalCreated = 0;
    totalRevoked = 0;
    
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
