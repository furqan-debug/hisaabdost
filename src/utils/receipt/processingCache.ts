
// Cache to prevent duplicate processing of the same file
const processedFiles = new Map<string, { 
  timestamp: number, 
  inProgress: boolean,
  receiptUrl?: string 
}>();

// Rate limiting
let lastProcessTime = 0;
const MIN_PROCESS_INTERVAL = 1000; // 1 second

/**
 * Check if file can be processed (rate limiting and duplicate check)
 */
export function canProcessFile(fingerprint: string): boolean {
  const now = Date.now();
  
  // Rate limiting check
  if (now - lastProcessTime < MIN_PROCESS_INTERVAL) {
    console.log('Rate limit: Request too soon');
    return false;
  }
  
  // Check if already processing
  const fileData = processedFiles.get(fingerprint);
  if (fileData?.inProgress) {
    console.log(`File already being processed: ${fingerprint}`);
    return false;
  }
  
  return true;
}

/**
 * Mark file as being processed
 */
export function markFileInProgress(fingerprint: string): void {
  lastProcessTime = Date.now();
  processedFiles.set(fingerprint, { 
    timestamp: Date.now(), 
    inProgress: true 
  });
}

/**
 * Mark file processing as complete
 */
export function markFileComplete(fingerprint: string, receiptUrl?: string): void {
  processedFiles.set(fingerprint, { 
    timestamp: Date.now(), 
    inProgress: false,
    receiptUrl 
  });
}

/**
 * Get cached result if available
 */
export function getCachedResult(fingerprint: string): string | null {
  const fileData = processedFiles.get(fingerprint);
  if (fileData?.receiptUrl && fileData.receiptUrl.includes('supabase')) {
    const timeSinceProcess = Date.now() - fileData.timestamp;
    if (timeSinceProcess < 10000) { // 10 seconds
      return fileData.receiptUrl;
    }
  }
  return null;
}

// Cleanup old cache entries
setInterval(() => {
  const now = Date.now();
  const expirationTime = 30 * 60 * 1000; // 30 minutes
  
  for (const [fingerprint, data] of processedFiles.entries()) {
    if (now - data.timestamp > expirationTime) {
      processedFiles.delete(fingerprint);
    }
  }
}, 60000);
