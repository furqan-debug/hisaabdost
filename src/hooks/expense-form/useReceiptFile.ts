
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { ExpenseFormData } from "./types";
import { 
  cleanupAllBlobUrls, 
  cleanupUnusedBlobUrls,
  markBlobUrlForCleanup 
} from "@/utils/blobUrlManager";
import { 
  processReceiptFile as processFile,
  handleReceiptFileChange as handleFileInputChange
} from "@/utils/receiptFileProcessor";

// Cache to prevent processing the same file multiple times
const processedFileCache = new Map<string, number>();

interface UseReceiptFileProps {
  formData: ExpenseFormData;
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptFile({ formData, updateField }: UseReceiptFileProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  
  // Track the current active blob URL
  const currentBlobUrlRef = useRef<string | null>(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Generate a fingerprint for a file to detect duplicates
  const getFileFingerprint = useCallback((file: File): string => {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }, []);

  // Function to process a file directly (without event)
  const processReceiptFile = useCallback(async (file: File) => {
    if (!isMountedRef.current) return null;
    
    // Generate fingerprint for deduplication
    const fingerprint = getFileFingerprint(file);
    const now = Date.now();
    
    // Check if this file was recently processed (within last 5 seconds)
    if (processedFileCache.has(fingerprint)) {
      const lastProcessed = processedFileCache.get(fingerprint) || 0;
      if (now - lastProcessed < 5000) {
        console.log(`Skipping duplicate file processing: ${file.name} (processed ${now - lastProcessed}ms ago)`);
        return formData.receiptUrl; // Return current URL without reprocessing
      }
    }
    
    // Mark this file as processed
    processedFileCache.set(fingerprint, now);
    
    // Set a cleanup timeout for the cache entry to prevent memory leaks
    setTimeout(() => {
      if (processedFileCache.get(fingerprint) === now) {
        processedFileCache.delete(fingerprint);
      }
    }, 10000);
    
    console.log(`useReceiptFile: Processing file ${file.name} (${file.size} bytes)`);
    
    try {
      const result = await processFile(
        file, 
        user?.id, 
        currentBlobUrlRef.current, 
        updateField, 
        setIsUploading
      );
      
      // Only update refs if component is still mounted
      if (isMountedRef.current) {
        // Track the new URL
        if (result) {
          if (result.startsWith('blob:')) {
            currentBlobUrlRef.current = result;
          } else {
            // If we got a permanent URL, clear the blob URL reference
            currentBlobUrlRef.current = null;
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error in processReceiptFile:", error);
      // In case of error, don't change URL references
      return null;
    }
  }, [formData.receiptUrl, user?.id, updateField, getFileFingerprint]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMountedRef.current) return;
    
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    console.log("useReceiptFile: File input change detected");
    
    try {
      await handleFileInputChange(
        e, 
        user?.id, 
        currentBlobUrlRef.current, 
        updateField, 
        setIsUploading
      );
      
      // Update current blob URL reference
      if (isMountedRef.current && formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
        currentBlobUrlRef.current = formData.receiptUrl;
      }
    } catch (error) {
      console.error("Error in handleFileChange:", error);
    }
  }, [user?.id, updateField, formData.receiptUrl]);

  // Set mounted flag on mount and clear on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      console.log("useReceiptFile: Component unmounting, cleaning up blob URLs");
      
      // Wait a moment before cleaning everything up
      setTimeout(() => {
        cleanupAllBlobUrls();
      }, 1000);
    };
  }, []);

  // Cleanup URLs that are no longer in use with periodic sweep
  // Use a stable reference to the cleanup function
  const cleanupUnused = useCallback(() => {
    if (isMountedRef.current) {
      cleanupUnusedBlobUrls();
    }
  }, []);
  
  useEffect(() => {
    console.log("useReceiptFile: Setting up periodic cleanup of unused blob URLs");
    
    const cleanupTimer = setInterval(cleanupUnused, 10000);
    
    return () => {
      console.log("useReceiptFile: Clearing cleanup timer");
      clearInterval(cleanupTimer);
    };
  }, [cleanupUnused]);

  // Cleanup when receiptUrl changes to a non-blob URL
  // Use a ref to track the previous URL to avoid unnecessary effect runs
  const prevReceiptUrlRef = useRef(formData.receiptUrl);
  
  useEffect(() => {
    // Skip if the URL hasn't actually changed
    if (prevReceiptUrlRef.current === formData.receiptUrl) {
      return;
    }
    
    prevReceiptUrlRef.current = formData.receiptUrl;
    
    // If the current receipt URL is not a blob URL (e.g., it's a Supabase URL),
    // we can mark previous blob URLs for cleanup since they're no longer needed
    if (formData.receiptUrl && !formData.receiptUrl.startsWith('blob:')) {
      console.log("useReceiptFile: Receipt URL changed to permanent URL, marking blob URLs for cleanup");
      
      // Mark previous blob URL for cleanup if it exists
      if (currentBlobUrlRef.current && currentBlobUrlRef.current !== formData.receiptUrl) {
        markBlobUrlForCleanup(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
    } else if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
      console.log("useReceiptFile: Receipt URL changed to blob URL");
      currentBlobUrlRef.current = formData.receiptUrl;
    }
  }, [formData.receiptUrl]);

  return { 
    handleFileChange, 
    isUploading, 
    processReceiptFile 
  };
}
