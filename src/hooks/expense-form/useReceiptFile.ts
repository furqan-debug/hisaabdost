import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ExpenseFormData } from "./types";
import { cleanupUnusedBlobUrls, markBlobUrlForCleanup } from "@/utils/blobManager";
import { processReceiptFile as processFile } from "@/utils/receiptFileProcessor";

interface UseReceiptFileProps {
  formData: ExpenseFormData;
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptFile({ formData, updateField }: UseReceiptFileProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const currentBlobUrlRef = useRef<string | null>(null);
  
  // Keep track of the current blob URL
  useEffect(() => {
    if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
      if (currentBlobUrlRef.current && currentBlobUrlRef.current !== formData.receiptUrl) {
        // If we have a different blob URL, mark the old one for cleanup
        markBlobUrlForCleanup(currentBlobUrlRef.current);
      }
      currentBlobUrlRef.current = formData.receiptUrl;
    }
  }, [formData.receiptUrl]);

  // Function to process the file and automatically add items to the expense list
  const processReceiptFile = async (file: File) => {
    console.log(`useReceiptFile: Processing file ${file.name} (${file.size} bytes)`);

    try {
      const result = await processFile(file, user?.id, currentBlobUrlRef.current, updateField, setIsUploading);

      // Return just the URL in this hook without trying to add items
      // Item addition will be handled by the scan dialog directly
      return result;
    } catch (error) {
      console.error("Error processing receipt:", error);
      return null;
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      console.log("useReceiptFile: Component unmounting, cleaning up blob URLs");
      
      // If we have a current blob URL, mark it for cleanup
      if (currentBlobUrlRef.current) {
        markBlobUrlForCleanup(currentBlobUrlRef.current);
      }
      
      // Cleanup unused blob URLs
      setTimeout(() => {
        cleanupUnusedBlobUrls();
      }, 500);
    };
  }, []);

  return { processReceiptFile, isUploading };
}
