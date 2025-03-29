import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { processReceiptFile as processFile } from "@/utils/receiptFileProcessor";

export function useReceiptFile({ formData, updateField }: UseReceiptFileProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const currentBlobUrlRef = useRef<string | null>(null);

  // Function to process a receipt file automatically and add each item to the expense list
  const processReceiptFile = async (file: File) => {
    console.log(`useReceiptFile: Processing file ${file.name} (${file.size} bytes)`);
    
    try {
      const result = await processFile(file, user?.id, currentBlobUrlRef.current, updateField, setIsUploading);
      
      // If file is successfully processed, update the blob URL reference for cleanup
      if (result) {
        if (result.startsWith('blob:')) {
          currentBlobUrlRef.current = result;
        } else {
          currentBlobUrlRef.current = null;
        }
      }
      
      // Automatically add each expense item to the expense list
      // Assuming 'result' contains parsed items in the format: [{ name, amount, category, date }]
      if (result && Array.isArray(result)) {
        result.forEach(item => {
          updateField('expenses', prevExpenses => [...prevExpenses, item]); // Automatically add each item to the list
        });
      }
      return result;
    } catch (error) {
      console.error("Error in processReceiptFile:", error);
      return null;
    }
  };

  // Cleanup blob URLs and other resources on unmount or after processing
  useEffect(() => {
    return () => {
      console.log("useReceiptFile: Cleaning up blob URLs");
      setTimeout(() => cleanupAllBlobUrls(), 1000);
    };
  }, []);

  return { processReceiptFile, isUploading };
}
