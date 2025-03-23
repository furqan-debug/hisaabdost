
import { useEffect } from "react";
import { toast } from "sonner";
import { ExpenseFormData } from "./types";

interface UseReceiptFileProps {
  formData: ExpenseFormData;
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptFile({ formData, updateField }: UseReceiptFileProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Receipt file selected:", file.name, file.type, file.size);
      
      if (!file.type.match('image.*') && file.type !== 'application/pdf') {
        toast.error('Please upload an image or PDF file');
        return;
      }

      updateField('receiptFile', file);
      const url = URL.createObjectURL(file);
      updateField('receiptUrl', url);

      // Clean up previous blob URL if it exists
      if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.receiptUrl);
      }
      
      toast.success('Receipt uploaded successfully');
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
