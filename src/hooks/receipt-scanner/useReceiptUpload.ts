
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadReceipt } from "@/utils/receiptUtils";

export function useReceiptUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) {
      toast.error("No file provided for upload");
      return null;
    }

    setIsUploading(true);
    console.log(`Uploading receipt: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    try {
      // Check if file is too large
      if (file.size > 8 * 1024 * 1024) {
        toast.error("Receipt image is too large. Please use an image smaller than 8MB for faster processing");
        return null;
      }
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file (JPG, PNG, etc.)");
        return null;
      }

      const uploadedUrl = await uploadReceipt(file);
      if (uploadedUrl) {
        console.log("Receipt uploaded to storage:", uploadedUrl);
        return uploadedUrl;
      }
      
      console.log("Failed to upload receipt to storage, continuing with local URL");
      return null;
    } catch (error) {
      console.error("Error uploading receipt:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    handleUpload
  };
}
