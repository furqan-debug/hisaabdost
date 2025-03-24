import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ExpenseFormData } from "./types";

interface UseReceiptFileProps {
  formData: ExpenseFormData;
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptFile({ formData, updateField }: UseReceiptFileProps) {
  // Keep a ref to track the current blob URL to avoid stale closures in cleanup
  const currentBlobUrlRef = useRef<string | null>(null);

  const cleanupBlobUrl = (url: string | null) => {
    if (url && url.startsWith('blob:')) {
      try {
        console.log("Cleaning up blob URL:", url);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error revoking blob URL:", error);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Only allow images
        if (!file.type.startsWith('image/')) {
          toast.error('Please upload an image file');
          return;
        }
        
        // Clean up previous blob URL if it exists
        if (currentBlobUrlRef.current) {
          cleanupBlobUrl(currentBlobUrlRef.current);
          currentBlobUrlRef.current = null;
        }
        
        // Create local blob URL for preview
        const localUrl = URL.createObjectURL(file);
        console.log("Created new blob URL for receipt:", localUrl);
        
        // Update the ref with the new URL
        currentBlobUrlRef.current = localUrl;
        
        updateField('receiptUrl', localUrl);
        updateField('receiptFile', file);
      } catch (error) {
        console.error("Error handling receipt file:", error);
        toast.error('Failed to process receipt file');
      }
    }
  };

  // Cleanup blob URLs on unmount or when the URL changes
  useEffect(() => {
    // Store the current URL in a variable that won't change during cleanup
    const blobUrl = formData.receiptUrl;
    
    if (blobUrl && blobUrl.startsWith('blob:')) {
      currentBlobUrlRef.current = blobUrl;
    }
    
    return () => {
      if (currentBlobUrlRef.current) {
        cleanupBlobUrl(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
    };
  }, [formData.receiptUrl]);

  return { handleFileChange };
}
