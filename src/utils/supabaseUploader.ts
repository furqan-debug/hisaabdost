
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Cache to track uploads in progress and completed
const uploadCache = new Map<string, Promise<string | null>>();

/**
 * Upload a file to Supabase storage with deduplication
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
    
    // Generate a unique file fingerprint based on name, size, and last modified time
    const fileFingerprint = generateFileFingerprint(file);
    
    // Check if this file is already being uploaded
    if (uploadCache.has(fileFingerprint)) {
      console.log(`File with fingerprint ${fileFingerprint} is already being uploaded, returning cached promise`);
      return uploadCache.get(fileFingerprint);
    }
    
    // Create upload promise and store in cache
    const uploadPromise = performUpload(file, userId, fileFingerprint);
    uploadCache.set(fileFingerprint, uploadPromise);
    
    // Set a timeout to clean up the cache entry
    setTimeout(() => {
      uploadCache.delete(fileFingerprint);
    }, 60000); // Clear after 1 minute
    
    return uploadPromise;
  } catch (error) {
    console.error("Error in uploadToSupabase:", error);
    return null;
  } finally {
    if (setIsUploading) setIsUploading(false);
  }
}

/**
 * Perform the actual upload to Supabase
 */
async function performUpload(
  file: File, 
  userId: string | undefined,
  fileFingerprint: string
): Promise<string | null> {
  console.log(`Starting upload of file to Supabase: ${file.name} (${fileFingerprint})`);
  
  // Create a unique file name with timestamp and random string
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const fileExt = file.name.split('.').pop();
  const filePath = `${timestamp}-${randomString}.${fileExt}`;
  
  // Create storage path based on user ID or fallback to 'public'
  const storagePath = userId ? `users/${userId}/${filePath}` : `public/${filePath}`;
  
  // Define the bucket name we want to use
  const bucketName = 'receipts';
  
  try {
    // Ensure the bucket exists before attempting to upload
    await ensureBucketExists(bucketName);
    
    // Upload file to the bucket
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      console.error('Error uploading to bucket:', error);
      toast.error(`Upload failed: ${error.message}`);
      return null;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);
      
    console.log(`File uploaded successfully to ${bucketName}: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("Error during Supabase upload:", error);
    return null;
  }
}

/**
 * Generate a unique fingerprint for a file to detect duplicates
 */
function generateFileFingerprint(file: File): string {
  // Create a fingerprint based on file properties
  return `${file.name}-${file.size}-${file.lastModified}`;
}

/**
 * Ensures that the specified bucket exists and is accessible
 * This function will create the bucket if it doesn't exist
 */
async function ensureBucketExists(bucketName: string): Promise<boolean> {
  try {
    // First try to list files in the bucket as a quick check
    const { error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });
    
    // If no error, bucket exists and we have access
    if (!listError) {
      return true;
    }
    
    console.log(`Bucket access check failed, attempting to create bucket '${bucketName}'`);
    
    // Try to create the bucket
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760 // 10MB limit
    });
    
    if (createError) {
      // If error is not just "bucket already exists", log it but continue anyway
      if (!createError.message.includes('already exists')) {
        console.warn(`Couldn't create bucket: ${createError.message}`);
        // We'll try to upload anyway as a last resort
      } else {
        console.log(`Bucket '${bucketName}' already exists according to API`);
      }
    } else {
      console.log(`Successfully created bucket '${bucketName}'`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error ensuring bucket '${bucketName}' exists:`, error);
    // Return true anyway as a last resort to attempt upload
    return true;
  }
}
