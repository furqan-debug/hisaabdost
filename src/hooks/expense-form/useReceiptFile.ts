
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
      if (!file.type.match('image.*') && file.type !== 'application/pdf') {
        toast.error('Please upload an image or PDF file');
        return;
      }

      updateField('receiptFile', file);
      const url = URL.createObjectURL(file);
      updateField('receiptUrl', url);

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
  }, []);

  return { handleFileChange };
}
