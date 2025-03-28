
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { ExpenseFormData } from "./types";
import { 
  cleanupAllBlobUrls, 
  cleanupUnusedBlobUrls,
  markBlobUrlForCleanup 
} from "@/utils/blobUrlManager";
import { 
  processReceiptFile as processFile,
  handleReceiptFileChange as handleFileInputChange,
  generateFileFingerprint
} from "@/utils/receiptFileProcessor";

interface UseReceiptFileProps {
  formData: ExpenseFormData;
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

// Cache for tracking processing operations by ID
const processingOperationsCache = new Map<string, boolean>();

export function useReceiptFile({ formData, updateField }: UseReceiptFileProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  
  // Track the current active blob URL
  const currentBlobUrlRef = useRef<string | null>(null);
  // Track processed files to prevent duplicate processing using fingerprints
  const processedFilesRef = useRef<Set<string>>(new Set());
  // Track the last processed timestamp to implement rate limiting
  const lastProcessTimeRef = useRef<number>(0);
  
  // Function to process a file directly (without event)
  const processReceiptFile = async (file: File) => {
    if (!file) {
      console.error("useReceiptFile: No file provided to process");
      return null;
    }
    
    // Generate file fingerprint for tracking
    const fingerprint = generateFileFingerprint(file);
    console.log(`useReceiptFile: Processing file ${file.name} (${file.size} bytes, fingerprint: ${fingerprint})`);
    
    // Implement rate limiting
    const now = Date.now();
    const minInterval = 1000; // 1 second
    if (now - lastProcessTimeRef.current < minInterval) {
      console.log("useReceiptFile: Rate limiting applied, request too soon after last process");
      return currentBlobUrlRef.current;
    }
    lastProcessTimeRef.current = now;
    
    // Prevent duplicate processing
    if (processedFilesRef.current.has(fingerprint)) {
      console.log("useReceiptFile: File already processed, skipping duplicate:", fingerprint);
      return currentBlobUrlRef.current; // Return the existing URL reference if available
    }
    
    // Check if file is already being processed
    if (processingOperationsCache.has(fingerprint)) {
      console.log("useReceiptFile: File is currently being processed, skipping duplicate request:", fingerprint);
      return currentBlobUrlRef.current;
    }
    
    // Mark file as being processed
    processingOperationsCache.set(fingerprint, true);
    
    try {
      // Mark file as processed in our component instance
      processedFilesRef.current.add(fingerprint);

      const result = await processFile(
        file, 
        user?.id, 
        currentBlobUrlRef.current, 
        updateField, 
        setIsUploading
      );
      
      // Track the new URL: if it's a blob URL, update the reference; otherwise clear it
      if (result) {
        if (result.startsWith('blob:')) {
          currentBlobUrlRef.current = result;
        } else {
          currentBlobUrlRef.current = null;
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error in processReceiptFile:", error);
      return null;
    } finally {
      // Mark processing as complete
      processingOperationsCache.delete(fingerprint);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("useReceiptFile: File input change detected");
    const file = e.target.files?.[0];
    
    if (!file) {
      console.log("useReceiptFile: No file selected");
      return;
    }
    
    const fingerprint = generateFileFingerprint(file);
    console.log(`useReceiptFile: File selected: ${file.name} (fingerprint: ${fingerprint})`);
    
    // Check if this exact file is already being processed
    if (processingOperationsCache.has(fingerprint)) {
      console.log("useReceiptFile: This file is already being processed, ignoring duplicate event");
      // Reset the input value to allow selecting the same file again
      e.target.value = '';
      return;
    }
    
    try {
      await handleFileInputChange(
        e, 
        user?.id, 
        currentBlobUrlRef.current, 
        updateField, 
        setIsUploading
      );
      
      // Update current blob URL reference if necessary
      if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
        currentBlobUrlRef.current = formData.receiptUrl;
      }
    } catch (error) {
      console.error("Error in handleFileChange:", error);
    }
  };

  // Cleanup blob URLs on unmount, with a delay to ensure they're not in use
  useEffect(() => {
    return () => {
      console.log("useReceiptFile: Component unmounting, cleaning up blob URLs");
      setTimeout(() => {
        cleanupAllBlobUrls();
      }, 1000);
    };
  }, []);

  // Periodic cleanup of unused blob URLs (every 10 seconds)
  useEffect(() => {
    console.log("useReceiptFile: Setting up periodic cleanup of unused blob URLs");
    
    const cleanupTimer = setInterval(() => {
      cleanupUnusedBlobUrls();
    }, 10000);
    
    return () => {
      console.log("useReceiptFile: Clearing cleanup timer");
      clearInterval(cleanupTimer);
    };
  }, []);

  // Cleanup when receiptUrl changes to a non-blob URL
  useEffect(() => {
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
