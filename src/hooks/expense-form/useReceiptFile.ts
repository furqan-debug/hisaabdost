
import { useEffect } from "react";
import { toast } from "sonner";
import { ExpenseFormData } from "./types";

interface UseReceiptFileProps {
  formData: ExpenseFormData;
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptFile({ formData, updateField }: UseReceiptFileProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simplified file handler that just sets a local URL
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Only allow images
        if (!file.type.startsWith('image/')) {
          toast.error('Please upload an image file');
          return;
        }
        
        // Clean up previous blob URL if it exists
        if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
          URL.revokeObjectURL(formData.receiptUrl);
        }
        
        // Create local blob URL for preview
        const localUrl = URL.createObjectURL(file);
        console.log("Created new blob URL for receipt:", localUrl);
        updateField('receiptUrl', localUrl);
        updateField('receiptFile', file);
      } catch (error) {
        console.error("Error handling receipt file:", error);
        toast.error('Failed to process receipt file');
      }
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
        console.log("Cleaning up blob URL on unmount:", formData.receiptUrl);
        URL.revokeObjectURL(formData.receiptUrl);
      }
    };
  }, [formData.receiptUrl]);

  return { handleFileChange };
}
