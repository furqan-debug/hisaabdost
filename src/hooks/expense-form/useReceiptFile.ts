
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ExpenseFormData } from "./types";
import { cleanupAllBlobUrls, cleanupUnusedBlobUrls, markBlobUrlForCleanup } from "@/utils/blobUrlManager";
import { processReceiptFile as processFile } from "@/utils/receiptFileProcessor";

interface UseReceiptFileProps {
  formData: ExpenseFormData;
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptFile({ formData, updateField }: UseReceiptFileProps) {
  const auth = useAuth();
  const userId = auth?.user?.id || null;
  const [isUploading, setIsUploading] = useState(false);
  const currentBlobUrlRef = useRef<string | null>(null);

  // Function to process the file and automatically add items to the expense list
  const processReceiptFile = async (file: File) => {
    console.log(`useReceiptFile: Processing file ${file.name} (${file.size} bytes)`);

    try {
      const result = await processFile(file, userId, currentBlobUrlRef.current, updateField, setIsUploading);

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
      setTimeout(() => {
        cleanupAllBlobUrls();  // Now this function should be available
      }, 1000);
    };
  }, []);

  return { processReceiptFile, isUploading };
}
