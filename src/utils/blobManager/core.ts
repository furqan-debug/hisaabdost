/**
 * Core blob URL management functionality
 */

// Track references to blob URLs to prevent premature garbage collection
const blobUrlReferences = new Map<string, number>();

// Add debug tracking to find potential memory leaks
let totalCreated = 0;
let totalRevoked = 0;

// Keep track of the last cleanup time to avoid too frequent cleanups
let lastCleanupTime = 0;

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
 * Get access to the internal reference map (for cleanup utilities)
 * @internal
 */
export function getBlobUrlReferences(): Map<string, number> {
  return blobUrlReferences;
}

/**
 * Get and update the last cleanup time
 * @internal
 */
export function getLastCleanupTime(): number {
  return lastCleanupTime;
}

/**
 * Set the last cleanup time
 * @internal
 */
export function setLastCleanupTime(time: number): void {
  lastCleanupTime = time;
}

/**
 * Reset tracking counters (for testing or emergency cleanup)
 * @internal
 */
export function resetBlobUrlTracking(): void {
  totalCreated = 0;
  totalRevoked = 0;
  blobUrlReferences.clear();
}
