
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ExpenseFormData } from "./types";

interface UseReceiptFileProps {
  formData: ExpenseFormData;
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptFile({ formData, updateField }: UseReceiptFileProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  
  // Keep a ref to track the current blob URL to avoid stale closures in cleanup
  const currentBlobUrlRef = useRef<string | null>(null);

  const cleanupBlobUrl = (url: string | null) => {
    if (url && url.startsWith('blob:')) {
      try {
        console.log("Cleaning up blob URL:", url);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error revoking blob URL:", error);
      }
    }
  };

  const uploadToSupabase = async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return null;
    }

    setIsUploading(true);
    
    try {
      // Create the storage bucket if it doesn't exist yet
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(bucket => bucket.name === 'receipts')) {
        await supabase.storage.createBucket('receipts', {
          public: true,
          fileSizeLimit: 5242880 // 5MB
        });
      }
      
      // Create a unique file path for this user and receipt
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload the file to Supabase Storage with public access
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: '3600'
        });
      
      if (error) {
        console.error("Upload error:", error);
        throw error;
      }
      
      // Get the public URL with a timestamp to prevent caching issues
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);
      
      // Add cache-busting parameter to the URL
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      console.log("Receipt uploaded successfully to:", publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error("Error uploading to Supabase:", error);
      toast.error('Failed to upload receipt. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Function to process a file directly (without event)
  const processReceiptFile = async (file: File) => {
    try {
      // Only allow images
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Clean up previous blob URL if it exists
      if (currentBlobUrlRef.current) {
        cleanupBlobUrl(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
      
      // Create local blob URL for preview
      const localUrl = URL.createObjectURL(file);
      console.log("Created new blob URL for receipt:", localUrl);
      
      // Update the ref with the new URL
      currentBlobUrlRef.current = localUrl;
      
      // Update form with local URL for immediate preview
      updateField('receiptUrl', localUrl);
      updateField('receiptFile', file);
      
      // Upload to Supabase and get permanent URL
      const supabaseUrl = await uploadToSupabase(file);
      
      // If upload was successful, update the form with the permanent URL
      if (supabaseUrl) {
        console.log("Updating receipt URL from blob to Supabase URL");
        updateField('receiptUrl', supabaseUrl);
      }
    } catch (error) {
      console.error("Error processing receipt file:", error);
      toast.error('Failed to process receipt file');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processReceiptFile(file);
      
      // Reset the input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  // Cleanup blob URLs on unmount or when the URL changes
  useEffect(() => {
    // Store the current URL in a variable that won't change during cleanup
    const blobUrl = formData.receiptUrl;
    
    if (blobUrl && blobUrl.startsWith('blob:')) {
      currentBlobUrlRef.current = blobUrl;
    }
    
    return () => {
      if (currentBlobUrlRef.current) {
        cleanupBlobUrl(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
    };
  }, [formData.receiptUrl]);

  return { handleFileChange, isUploading, processReceiptFile };
}
