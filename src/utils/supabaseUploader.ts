
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Upload a file to Supabase storage
 * @param file File to upload
 * @param userId User ID for storage path
 * @param setIsUploading Optional callback to update loading state
 * @returns URL of uploaded file or null on failure
 */
export async function uploadToSupabase(
  file: File,
  userId: string | undefined,
  setIsUploading?: (loading: boolean) => void
): Promise<string | null> {
  try {
    if (!file) return null;
    if (setIsUploading) setIsUploading(true);
    
    console.log(`Uploading file to Supabase...`);
    
    // Create a unique file name with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const fileExt = file.name.split('.').pop();
    const filePath = `${timestamp}-${randomString}.${fileExt}`;
    
    // Create storage path based on user ID or fallback to 'public'
    const storagePath = userId ? `users/${userId}/${filePath}` : `public/${filePath}`;
    
    // Define the bucket name we want to use
    const bucketName = 'receipts';
    
    // Upload file to the bucket
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      console.error('Error uploading to bucket:', error);
      return null;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);
      
    console.log(`File uploaded successfully to ${bucketName}`);
    return publicUrl;
    
  } catch (error) {
    console.error("Error uploading to Supabase:", error);
    return null;
  } finally {
    if (setIsUploading) setIsUploading(false);
  }
}
