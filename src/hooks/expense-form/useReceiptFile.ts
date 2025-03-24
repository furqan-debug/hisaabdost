import { useEffect } from "react";
import { toast } from "sonner";
import { ExpenseFormData } from "./types";
import { uploadReceipt } from "@/utils/receiptUtils";

interface UseReceiptFileProps {
  formData: ExpenseFormData;
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptFile({ formData, updateField }: UseReceiptFileProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Receipt file selected:", file.name, file.type, file.size);
      
      if (!file.type.match('image.*') && file.type !== 'application/pdf') {
        toast.error('Please upload an image or PDF file');
        return;
      }
      
      // Check file size (8MB limit)
      if (file.size > 8 * 1024 * 1024) {
        toast.error('File is too large. Please upload a file smaller than 8MB');
        return;
      }

      // Store the file object for further processing
      updateField('receiptFile', file);
      
      // Create local blob URL for preview
      const localUrl = URL.createObjectURL(file);
      updateField('receiptUrl', localUrl);

      // Clean up previous blob URL if it exists
      if (formData.receiptUrl && formData.receiptUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.receiptUrl);
      }
      
      // Show loading toast
      const uploadToast = toast.loading('Uploading receipt...');
      
      try {
        // Upload file to Supabase storage
        const publicUrl = await uploadReceipt(file);
        
        if (publicUrl) {
          // Update the form with the permanent storage URL
          updateField('receiptUrl', publicUrl);
          toast.dismiss(uploadToast);
          toast.success('Receipt uploaded successfully');
        } else {
          toast.dismiss(uploadToast);
          toast.error('Failed to upload receipt to storage');
          // Keep the local blob URL for preview even if upload fails
        }
      } catch (error) {
        console.error("Error uploading receipt:", error);
        toast.dismiss(uploadToast);
        toast.error('Error uploading receipt');
      }
    } else {
      console.log("No file selected in handleFileChange");
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
