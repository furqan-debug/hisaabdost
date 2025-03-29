import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ExpenseFormData } from "./types";
import { cleanupAllBlobUrls, cleanupUnusedBlobUrls, markBlobUrlForCleanup } from "@/utils/blobUrlManager";
import { processReceiptFile as processFile } from "@/utils/receiptFileProcessor";

export function useReceiptFile({ formData, updateField }: UseReceiptFileProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const currentBlobUrlRef = useRef<string | null>(null);

  // Function to process the file and automatically add items to the expense list
  const processReceiptFile = async (file: File) => {
    console.log(`useReceiptFile: Processing file ${file.name} (${file.size} bytes)`);

    try {
      const result = await processFile(file, user?.id, currentBlobUrlRef.current, updateField, setIsUploading);

      if (result) {
        // If the result contains items, automatically add each item to the expense list
        result.forEach((item: any) => {
          updateField('expenses', (prevExpenses: any[]) => [...prevExpenses, item]); // Add item to expense list
        });
        console.log("Items added to the expense list:", result);
      }

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
      setTimeout(() => {
        cleanupAllBlobUrls();  // Now this function should be available
      }, 1000);
    };
  }, []);

  return { processReceiptFile, isUploading };
}
