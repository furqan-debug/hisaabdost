
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

// Cache to track uploads in progress
const uploadCache = new Map<string, Promise<string | null>>();

/**
 * Generate a unique fingerprint for a file to detect duplicates
 */
export function generateFileFingerprint(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

/**
 * Upload a file to Supabase storage and return permanent URL
 */
export async function uploadToSupabase(
  file: File,
  userId: string | undefined
): Promise<string | null> {
  try {
    if (!file) {
      console.error("No file provided to uploadToSupabase");
      return null;
    }
    
    // Only allow images
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return null;
    }
    
    const fileFingerprint = generateFileFingerprint(file);
    console.log(`Starting upload: ${file.name} (${fileFingerprint})`);
    
    // Check if this file is already being uploaded
    if (uploadCache.has(fileFingerprint)) {
      console.log(`File already being uploaded: ${fileFingerprint}`);
      return uploadCache.get(fileFingerprint)!;
    }
    
    // Create upload promise and store in cache
    const uploadPromise = performUpload(file, userId, fileFingerprint);
    uploadCache.set(fileFingerprint, uploadPromise);
    
    // Clean up cache after upload
    setTimeout(() => {
      uploadCache.delete(fileFingerprint);
    }, 60000);
    
    return uploadPromise;
  } catch (error) {
    console.error("Error in uploadToSupabase:", error);
    toast.error('Failed to upload receipt file');
    return null;
  }
}

/**
 * Perform the actual upload to Supabase storage
 */
async function performUpload(
  file: File, 
  userId: string | undefined,
  fileFingerprint: string
): Promise<string | null> {
  console.log(`Uploading to Supabase: ${file.name} (${fileFingerprint})`);
  
  // Create a unique file name
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const fileExt = file.name.split('.').pop();
  const fileName = `${timestamp}-${randomString}.${fileExt}`;
  
  // Create storage path
  const storagePath = userId ? `users/${userId}/${fileName}` : `public/${fileName}`;
  const bucketName = 'receipts';
  
  try {
    // Ensure bucket exists
    await ensureBucketExists(bucketName);
    
    console.log(`Uploading to bucket: ${bucketName}, path: ${storagePath}`);
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      console.error('Supabase upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
      return null;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);
      
    console.log(`Upload successful! Public URL: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    toast.error('Failed to upload to storage');
    return null;
  }
}

/**
 * Ensure bucket exists
 */
async function ensureBucketExists(bucketName: string): Promise<void> {
  try {
    // Check if bucket exists by trying to list files
    const { error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });
    
    if (!listError) {
      return; // Bucket exists
    }
    
    console.log(`Creating bucket: ${bucketName}`);
    
    // Try to create the bucket
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (createError && !createError.message.includes('already exists')) {
      console.warn(`Couldn't create bucket: ${createError.message}`);
    }
  } catch (error) {
    console.error(`Error with bucket ${bucketName}:`, error);
  }
}
