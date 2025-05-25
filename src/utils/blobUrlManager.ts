
/**
 * Utility to manage blob URL lifecycles
 */

// Track all blob URLs created
const blobUrlRegistry = new Map<string, { inUse: boolean, created: number, references: number }>();

// Debug mode flag
const DEBUG = false;

/**
 * Create a blob URL and register it for tracking
 * @param blob The blob to create a URL for
 * @returns The created blob URL
 */
export function createManagedBlobUrl(blob: Blob): string {
  const url = URL.createObjectURL(blob);
  logDebug("Created new blob URL:", url);
  blobUrlRegistry.set(url, { inUse: true, created: Date.now(), references: 1 });
  return url;
}

/**
 * Mark a blob URL as no longer in use (but don't revoke immediately)
 * @param url The blob URL to mark
 */
export function markBlobUrlForCleanup(url: string | null | undefined): void {
  if (!url || !url.startsWith('blob:')) return;
  
  if (blobUrlRegistry.has(url)) {
    logDebug("Marking blob URL for cleanup:", url);
    const info = blobUrlRegistry.get(url);
    if (info) {
      // Decrease reference count
      const newRefCount = Math.max(0, info.references - 1);
      blobUrlRegistry.set(url, { 
        ...info, 
        inUse: newRefCount > 0,
        references: newRefCount
      });
      
      // If no references, clean up immediately to prevent memory leaks
      if (newRefCount === 0) {
        setTimeout(() => {
          try {
            URL.revokeObjectURL(url);
            blobUrlRegistry.delete(url);
            logDebug("Immediately cleaned up blob URL with zero references:", url);
          } catch (error) {
            console.error("Error revoking blob URL:", error);
            blobUrlRegistry.delete(url);
          }
        }, 100); // Small delay to allow any pending operations
      }
    }
  }
}

/**
 * Increment reference count for a blob URL
 * @param url The blob URL to reference
 */
export function addBlobUrlReference(url: string | null | undefined): void {
  if (!url || !url.startsWith('blob:')) return;
  
  if (blobUrlRegistry.has(url)) {
    const info = blobUrlRegistry.get(url)!;
    blobUrlRegistry.set(url, { 
      ...info, 
      inUse: true,
      references: info.references + 1
    });
    logDebug(`Added reference to ${url}, new count: ${info.references + 1}`);
  } else {
    // If URL wasn't created through our manager, add it now
    blobUrlRegistry.set(url, { inUse: true, created: Date.now(), references: 1 });
    logDebug(`Registered external blob URL: ${url}`);
  }
}

/**
 * Clean up a specific blob URL
 * @param url The URL to clean up
 * @param immediate Whether to clean up immediately or just mark for cleanup
 * @param force Whether to force cleanup regardless of reference count
 */
export function cleanupBlobUrl(
  url: string | null | undefined, 
  immediate = false,
  force = false
): void {
  if (!url || !url.startsWith('blob:')) return;

  if (immediate || force) {
    try {
      if (blobUrlRegistry.has(url)) {
        logDebug(`${force ? "Force cleaning" : "Immediately cleaning"} blob URL: ${url}`);
        URL.revokeObjectURL(url);
        blobUrlRegistry.delete(url);
      }
    } catch (error) {
      console.error("Error revoking blob URL:", error);
      blobUrlRegistry.delete(url);
    }
  } else {
    markBlobUrlForCleanup(url);
  }
}

/**
 * Clean up all blob URLs that are no longer in use
 */
export function cleanupUnusedBlobUrls(): void {
  logDebug("Cleaning up unused blob URLs");
  
  // Get the current time
  const now = Date.now();
  const staleThresholdMs = 2000; // Reduced to 2 seconds for faster cleanup
  
  let cleaned = 0;
  blobUrlRegistry.forEach((info, url) => {
    // Clean up URLs that have been unused for at least 2 seconds and have no references
    if (!info.inUse && info.references === 0 && (now - info.created > staleThresholdMs)) {
      try {
        logDebug(`Cleaning up unused blob URL: ${url} (age: ${now - info.created}ms)`);
        URL.revokeObjectURL(url);
        blobUrlRegistry.delete(url);
        cleaned++;
      } catch (error) {
        console.error("Error revoking blob URL:", error);
        // Remove from registry anyway to avoid memory leaks
        blobUrlRegistry.delete(url);
        cleaned++;
      }
    }
  });
  
  if (cleaned > 0) {
    logDebug(`Cleaned up ${cleaned} unused blob URLs`);
  }
}

/**
 * Clean up all blob URLs, used for component unmount
 */
export function cleanupAllBlobUrls(): void {
  logDebug(`Cleaning up all ${blobUrlRegistry.size} blob URLs`);
  
  blobUrlRegistry.forEach((_, url) => {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error revoking blob URL:", error);
    }
  });
  
  blobUrlRegistry.clear();
}

/**
 * Get statistics about tracked blob URLs
 */
export function getBlobUrlStats(): { total: number, active: number, inactive: number } {
  let active = 0;
  let inactive = 0;
  
  blobUrlRegistry.forEach(info => {
    if (info.inUse) active++;
    else inactive++;
  });
  
  return {
    total: blobUrlRegistry.size,
    active,
    inactive
  };
}

// Utility logging function
function logDebug(...args: any[]): void {
  if (DEBUG) {
    console.log(...args);
  }
}

// Periodic cleanup to prevent memory leaks
setInterval(() => {
  cleanupUnusedBlobUrls();
}, 5000); // Run every 5 seconds
