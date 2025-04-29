
/**
 * Utility to manage blob URLs to prevent memory leaks
 */

// Track references to blob URLs to prevent premature garbage collection
const blobUrlReferences = new Map<string, number>();

/**
 * Add a reference to a blob URL to prevent garbage collection
 */
export function addBlobUrlReference(url: string): void {
  const count = blobUrlReferences.get(url) || 0;
  blobUrlReferences.set(url, count + 1);
  console.log(`Added reference to blob URL: ${url}, count: ${count + 1}`);
}

/**
 * Mark a blob URL for cleanup when no more references exist
 */
export function markBlobUrlForCleanup(url: string): void {
  const count = blobUrlReferences.get(url) || 0;
  
  if (count <= 1) {
    // Last reference, clean up the URL
    blobUrlReferences.delete(url);
    try {
      URL.revokeObjectURL(url);
      console.log(`Revoked blob URL: ${url}`);
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
  blobUrlReferences.forEach((count, url) => {
    try {
      URL.revokeObjectURL(url);
      console.log(`Revoked blob URL during cleanup: ${url}`);
    } catch (error) {
      console.error(`Error revoking blob URL during cleanup: ${url}`, error);
    }
  });
  
  blobUrlReferences.clear();
  console.log("All blob URL references cleared");
}
