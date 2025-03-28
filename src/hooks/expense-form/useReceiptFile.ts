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
  // Track processed files to prevent duplicate processing using file names as a simple fingerprint
  const processedFilesRef = useRef<Set<string>>(new Set());

  // Function to process a file directly (without event)
  const processReceiptFile = async (file: File) => {
    console.log(`useReceiptFile: Processing file ${file.name} (${file.size} bytes)`);
    
    // Prevent duplicate processing
    if (processedFilesRef.current.has(file.name)) {
      console.log("useReceiptFile: File already processed, skipping duplicate:", file.name);
      return currentBlobUrlRef.current; // Return the existing URL reference if available
    }
    
    // Mark file as processed
    processedFilesRef.current.add(file.name);

    try {
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
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("useReceiptFile: File input change detected");
    
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
