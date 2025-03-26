
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Track if we've already shown the storage error
let storageErrorShown = false;

/**
 * Upload a file to Supabase storage
 * @param file The file to upload
 * @param userId The user ID for the file path
 * @param setIsUploading Optional state setter for upload status
 * @returns The public URL of the uploaded file, or null if upload failed
 */
export async function uploadToSupabase(
  file: File, 
  userId: string | undefined,
  setIsUploading?: (loading: boolean) => void
): Promise<string | null> {
  if (!userId) {
    toast.error('You must be logged in to upload files');
    return null;
  }

  if (setIsUploading) setIsUploading(true);
  
  try {
    // Create a unique file path for this user and receipt
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Skip bucket check and attempt direct upload
    console.log("Attempting direct upload to receipts bucket");
    
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
      
      // Check for specific error types
      if (error.message && (
          error.message.includes("The resource was not found") ||
          error.message.includes("violates row-level security policy") ||
          error.message.includes("bucket not found")
        )) {
        // Try creating the bucket directly instead of showing an error
        try {
          console.log("Attempting to create receipts bucket");
          const createResult = await supabase.storage.createBucket('receipts', {
            public: true,
            fileSizeLimit: 10485760 // 10MB limit
          });
          
          if (createResult.error) {
            console.error("Failed to create bucket:", createResult.error);
            // Silent error, continue with local preview
          } else {
            // Try upload again
            console.log("Bucket created, retrying upload");
            const retryUpload = await supabase.storage
              .from('receipts')
              .upload(filePath, file, {
                upsert: true,
                contentType: file.type,
                cacheControl: '3600'
              });
              
            if (!retryUpload.error) {
              const { data: urlData } = supabase.storage
                .from('receipts')
                .getPublicUrl(filePath);
              
              return `${urlData.publicUrl}?t=${Date.now()}`;
            }
          }
        } catch (createError) {
          console.error("Error creating bucket:", createError);
        }
        
        // Only show the storage error once per session
        if (!storageErrorShown) {
          console.error("Using local preview only (bucket issue)");
          storageErrorShown = true;
        }
        return null;
      }
      
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
    
    // Only show the error toast once
    if (!storageErrorShown) {
      console.error("Using local preview only (upload error)");
      storageErrorShown = true;
    }
    return null;
  } finally {
    if (setIsUploading) setIsUploading(false);
  }
}
