
/**
 * Utility to manage blob URLs to prevent memory leaks
 */

// Track references to blob URLs to prevent premature garbage collection
const blobUrlReferences = new Map<string, number>();

// Add debug tracking to find potential memory leaks
let totalCreated = 0;
let totalRevoked = 0;

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
    // Last reference, clean up the URL
    blobUrlReferences.delete(url);
    try {
      URL.revokeObjectURL(url);
      totalRevoked++;
      console.log(`Revoked blob URL: ${url} (Total revoked: ${totalRevoked})`);
    } catch (error) {
      console.error(`Error revoking blob URL: ${url}`, error);
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
  // Get all active blob URLs in the application
  const allUrls = Object.values(window)
    .filter(v => typeof v === 'string' && v.startsWith('blob:'))
    .map(v => v as string);
  
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
}
