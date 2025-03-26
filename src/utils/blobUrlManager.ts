
/**
 * Utility to manage blob URL lifecycles
 */

// Track all blob URLs created
const blobUrlRegistry = new Map<string, { inUse: boolean, created: number }>();

/**
 * Create a blob URL and register it for tracking
 * @param blob The blob to create a URL for
 * @returns The created blob URL
 */
export function createManagedBlobUrl(blob: Blob): string {
  const url = URL.createObjectURL(blob);
  console.log("Created new blob URL:", url);
  blobUrlRegistry.set(url, { inUse: true, created: Date.now() });
  return url;
}

/**
 * Mark a blob URL as no longer in use (but don't revoke immediately)
 * @param url The blob URL to mark
 */
export function markBlobUrlForCleanup(url: string | null | undefined): void {
  if (!url || !url.startsWith('blob:')) return;
  
  if (blobUrlRegistry.has(url)) {
    console.log("Marking blob URL for cleanup:", url);
    const info = blobUrlRegistry.get(url);
    if (info) {
      blobUrlRegistry.set(url, { ...info, inUse: false });
    }
  }
}

/**
 * Clean up a specific blob URL
 * @param url The URL to clean up
 * @param immediate Whether to clean up immediately or just mark for cleanup
 */
export function cleanupBlobUrl(url: string | null | undefined, immediate = false): void {
  if (!url || !url.startsWith('blob:')) return;

  if (immediate) {
    try {
      if (blobUrlRegistry.has(url)) {
        console.log("Immediately cleaning up blob URL:", url);
        URL.revokeObjectURL(url);
        blobUrlRegistry.delete(url);
      }
    } catch (error) {
      console.error("Error revoking blob URL:", error);
    }
  } else {
    markBlobUrlForCleanup(url);
  }
}

/**
 * Clean up all blob URLs that are no longer in use
 */
export function cleanupUnusedBlobUrls(): void {
  console.log("Cleaning up unused blob URLs");
  
  // Get the current time
  const now = Date.now();
  
  blobUrlRegistry.forEach((info, url) => {
    // Only clean up URLs that have been unused for at least 3 seconds
    if (!info.inUse && (now - info.created > 3000)) {
      try {
        console.log("Cleaning up unused blob URL:", url);
        URL.revokeObjectURL(url);
        blobUrlRegistry.delete(url);
      } catch (error) {
        console.error("Error revoking blob URL:", error);
        // Remove from registry anyway to avoid memory leaks
        blobUrlRegistry.delete(url);
      }
    }
  });
}

/**
 * Clean up all blob URLs, used for component unmount
 */
export function cleanupAllBlobUrls(): void {
  console.log("Cleaning up all blob URLs");
  
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
