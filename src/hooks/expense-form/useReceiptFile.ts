import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ExpenseFormData } from "./types";
import { checkReceiptsBucketExists, createReceiptsBucket } from "@/utils/testSupabaseStorage";

interface UseReceiptFileProps {
  formData: ExpenseFormData;
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptFile({ formData, updateField }: UseReceiptFileProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  
  // Keep track of all blob URLs created during the component's lifetime
  const blobUrlsRef = useRef<Set<string>>(new Set());
  // Track the current active blob URL
  const currentBlobUrlRef = useRef<string | null>(null);

  // Function to clean up a single blob URL
  const cleanupBlobUrl = (url: string | null) => {
    if (url && url.startsWith('blob:')) {
      try {
        console.log("Cleaning up blob URL:", url);
        URL.revokeObjectURL(url);
        blobUrlsRef.current.delete(url);
      } catch (error) {
        console.error("Error revoking blob URL:", error);
      }
    }
  };

  // Function to clean up all blob URLs
  const cleanupAllBlobUrls = () => {
    blobUrlsRef.current.forEach(url => {
      try {
        console.log("Cleaning up blob URL:", url);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error revoking blob URL:", error);
      }
    });
    blobUrlsRef.current.clear();
  };

  const uploadToSupabase = async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return null;
    }

    setIsUploading(true);
    
    try {
      // Check if the receipts bucket exists
      const bucketExists = await checkReceiptsBucketExists();
      if (!bucketExists) {
        // Don't try to create the bucket automatically from here
        // It should be created by an admin using the debugger tool
        toast.error('Receipt storage is not configured. Please contact support.');
        return null;
      }
      
      // Create a unique file path for this user and receipt
      const fileExt = file.name.split('.').pop() || 'jpg';
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
        // Check if the error message indicates the bucket doesn't exist
        if (error.message && error.message.includes("The resource was not found")) {
          toast.error('Receipt storage is not configured. Please contact support.');
          return null;
        }
        
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
      
      // Create local blob URL for preview
      const localUrl = URL.createObjectURL(file);
      console.log("Created new blob URL for receipt:", localUrl);
      
      // Clean up previous blob URL if it exists
      if (currentBlobUrlRef.current) {
        cleanupBlobUrl(currentBlobUrlRef.current);
      }
      
      // Track the new blob URL
      blobUrlsRef.current.add(localUrl);
      currentBlobUrlRef.current = localUrl;
      
      // Update form with local URL for immediate preview
      updateField('receiptUrl', localUrl);
      updateField('receiptFile', file);
      
      // Upload to Supabase and get permanent URL
      const supabaseUrl = await uploadToSupabase(file);
      
      // If upload was successful, update the form with the permanent URL
      if (supabaseUrl) {
        console.log("Updating receipt URL from blob to Supabase URL");
        
        // Now we can safely clean up the blob URL since we have a permanent URL
        if (currentBlobUrlRef.current) {
          cleanupBlobUrl(currentBlobUrlRef.current);
          currentBlobUrlRef.current = null;
        }
        
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

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      cleanupAllBlobUrls();
    };
  }, []);

  // Cleanup when receiptUrl changes to a non-blob URL
  useEffect(() => {
    // If the current receipt URL is not a blob URL (e.g., it's a Supabase URL),
    // we can clean up any existing blob URLs since they're no longer needed
    if (formData.receiptUrl && !formData.receiptUrl.startsWith('blob:')) {
      // Clean up any lingering blob URLs
      if (currentBlobUrlRef.current) {
        cleanupBlobUrl(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
    }
  }, [formData.receiptUrl]);

  return { handleFileChange, isUploading, processReceiptFile };
}
