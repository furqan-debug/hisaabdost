import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Track if we've already tried creating the bucket
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
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log("Checking if file already exists...");

    // Check if file already exists to prevent duplicate uploads
    const { data: existingFiles, error: listError } = await supabase.storage
      .from('receipts')
      .list(userId);

    if (listError) {
      console.warn("Could not list files:", listError.message);
    } else if (existingFiles?.some(f => f.name === fileName)) {
      console.warn("File already exists. Skipping upload.");
      toast.info("File already exists. Skipping upload.");
      return null;
    }

    console.log("Uploading file to Supabase...");

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

      // If bucket is missing, attempt to create it (only once)
      if (error.message.includes("bucket not found") && !storageErrorShown) {
        storageErrorShown = true;

        console.log("Creating missing 'receipts' bucket...");
        const createBucket = await supabase.storage.createBucket('receipts', {
          public: true,
          fileSizeLimit: 10485760 // 10MB limit
        });

        if (createBucket.error) {
          console.error("Failed to create bucket:", createBucket.error);
        } else {
          console.log("Bucket created successfully. Retrying upload...");
          return await uploadToSupabase(file, userId, setIsUploading);
        }
      }

      toast.error("Upload failed. Please try again.");
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    console.log("Receipt uploaded successfully to:", publicUrl);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading to Supabase:", error);
    toast.error("An unexpected error occurred during upload.");
    return null;
  } finally {
    if (setIsUploading) setIsUploading(false);
  }
}
