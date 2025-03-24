
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
      // Only allow images
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Create local blob URL for preview
      const localUrl = URL.createObjectURL(file);
      updateField('receiptUrl', localUrl);
      updateField('receiptFile', file);

      // Clean up previous blob URL if it exists
      if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.receiptUrl);
      }
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.receiptUrl);
      }
    };
  }, [formData.receiptUrl]);

  return { handleFileChange };
}
