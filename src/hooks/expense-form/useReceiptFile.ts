
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

  // Function to process a file directly (without event)
  const processReceiptFile = async (file: File) => {
    const result = await processFile(
      file, 
      user?.id, 
      currentBlobUrlRef.current, 
      updateField, 
      setIsUploading
    );
    
    // Track the new URL
    if (result && result.startsWith('blob:')) {
      currentBlobUrlRef.current = result;
    } else {
      currentBlobUrlRef.current = null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileInputChange(
      e, 
      user?.id, 
      currentBlobUrlRef.current, 
      updateField, 
      setIsUploading
    );
    
    // Update current blob URL reference
    if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
      currentBlobUrlRef.current = formData.receiptUrl;
    }
  };

  // Cleanup blob URLs on unmount, but with a delay to ensure they're not still being accessed
  useEffect(() => {
    return () => {
      // Wait a moment before cleaning everything up
      setTimeout(() => {
        cleanupAllBlobUrls();
      }, 500);
    };
  }, []);

  // Cleanup URLs that are no longer in use with periodic sweep
  useEffect(() => {
    const cleanupTimer = setInterval(() => {
      cleanupUnusedBlobUrls();
    }, 5000);
    
    return () => clearInterval(cleanupTimer);
  }, []);

  // Cleanup when receiptUrl changes to a non-blob URL
  useEffect(() => {
    // If the current receipt URL is not a blob URL (e.g., it's a Supabase URL),
    // we can mark previous blob URLs for cleanup since they're no longer needed
    if (formData.receiptUrl && !formData.receiptUrl.startsWith('blob:')) {
      // We'll let the periodic cleanup handle these URLs
      if (currentBlobUrlRef.current && currentBlobUrlRef.current !== formData.receiptUrl) {
        markBlobUrlForCleanup(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
    } else if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
      currentBlobUrlRef.current = formData.receiptUrl;
    }
  }, [formData.receiptUrl]);

  return { handleFileChange, isUploading, processReceiptFile };
}
