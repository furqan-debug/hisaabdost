
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

interface UseReceiptFileProps {
  formData: ExpenseFormData;
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptFile({ formData, updateField }: UseReceiptFileProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  
  // Track the current active blob URL
  const currentBlobUrlRef = useRef<string | null>(null);
  // Track processed file fingerprints (using file name as a simple fingerprint)
  const processedFilesRef = useRef<Set<string>>(new Set());
  // Track component mount state
  const isMountedRef = useRef(true);

  // Function to process a file directly (without event)
  const processReceiptFile = useCallback(async (file: File) => {
    // Ensure we don't process after unmount
    if (!isMountedRef.current) {
      console.log("useReceiptFile: Component unmounted, skipping processing");
      return null;
    }
    
    console.log(`useReceiptFile: Processing file ${file.name} (${file.size} bytes)`);

    // Prevent duplicate processing: if file was already processed, skip reprocessing
    if (processedFilesRef.current.has(file.name)) {
      console.log("useReceiptFile: File already processed, skipping duplicate processing:", file.name);
      return currentBlobUrlRef.current;
    }
    // Mark this file as processed
    processedFilesRef.current.add(file.name);
    
    try {
      const result = await processFile(
        file, 
        user?.id, 
        currentBlobUrlRef.current, 
        updateField, 
        setIsUploading
      );
      
      // Only update references if still mounted
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
      return null;
    }
  }, [user?.id, updateField]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure we don't process after unmount
    if (!isMountedRef.current) {
      console.log("useReceiptFile: Component unmounted, skipping file change handling");
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
      
      // Only update references if still mounted
      if (isMountedRef.current) {
        // Update current blob URL reference if applicable
        if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
          currentBlobUrlRef.current = formData.receiptUrl;
        }
      }
    } catch (error) {
      console.error("Error in handleFileChange:", error);
    }
  }, [user?.id, updateField, formData.receiptUrl]);

  // Cleanup blob URLs on unmount, but with a delay to ensure they're not still being accessed
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      console.log("useReceiptFile: Component unmounting, cleaning up blob URLs");
      isMountedRef.current = false;
      
      setTimeout(() => {
        cleanupAllBlobUrls();
      }, 1000);
    };
  }, []);

  // Periodic cleanup of unused blob URLs
  useEffect(() => {
    console.log("useReceiptFile: Setting up periodic cleanup of unused blob URLs");
    const cleanupTimer = setInterval(() => {
      if (isMountedRef.current) {
        cleanupUnusedBlobUrls();
      }
    }, 10000); // Run every 10 seconds
    
    return () => {
      console.log("useReceiptFile: Clearing cleanup timer");
      clearInterval(cleanupTimer);
    };
  }, []);

  // Monitor receiptUrl changes to mark old blob URLs for cleanup
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (formData.receiptUrl && !formData.receiptUrl.startsWith('blob:')) {
      console.log("useReceiptFile: Receipt URL changed to permanent URL, marking blob URLs for cleanup");
      if (currentBlobUrlRef.current && currentBlobUrlRef.current !== formData.receiptUrl) {
        markBlobUrlForCleanup(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
    } else if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
      console.log("useReceiptFile: Receipt URL is a blob URL");
      currentBlobUrlRef.current = formData.receiptUrl;
    }
  }, [formData.receiptUrl]);

  return { handleFileChange, isUploading, processReceiptFile };
}
