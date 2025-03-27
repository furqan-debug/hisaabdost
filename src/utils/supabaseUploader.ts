
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
    
    // Check if storage bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    
    // Define the bucket we want to use
    const bucketName = 'receipts';
    
    // Check if our bucket exists
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    // If bucket doesn't exist, create one (this might fail if user doesn't have admin privileges)
    if (!bucketExists) {
      try {
        // Try to create bucket if it doesn't exist (requires admin privileges)
        const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
          public: true // Make receipts publicly accessible
        });
        
        if (createBucketError) {
          console.warn(`Could not create bucket: ${createBucketError.message}`);
          // Fall back to using any existing bucket
          const firstBucket = buckets && buckets.length > 0 ? buckets[0].name : null;
          if (firstBucket) {
            console.log(`Falling back to existing bucket: ${firstBucket}`);
            // Use the first available bucket
            const { data, error } = await supabase.storage
              .from(firstBucket)
              .upload(storagePath, file, {
                cacheControl: '3600',
                upsert: true
              });
              
            if (error) throw error;
            
            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
              .from(firstBucket)
              .getPublicUrl(storagePath);
              
            console.log(`File uploaded successfully to ${firstBucket}`);
            return publicUrl;
          } else {
            throw new Error('No storage buckets available');
          }
        }
      } catch (error) {
        console.error('Bucket creation error:', error);
        // Continue with upload attempt even if bucket creation fails
        // as it might already exist on the server but not in our list
      }
    }
    
    // Upload file to the bucket
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) {
      // If we get an error uploading to our preferred bucket, try a fallback
      console.error('Error uploading to primary bucket:', error);
      
      // Try to use any existing bucket as fallback
      if (buckets && buckets.length > 0) {
        const fallbackBucket = buckets[0].name;
        if (fallbackBucket !== bucketName) {
          console.log(`Trying fallback bucket: ${fallbackBucket}`);
          const { data: fallbackData, error: fallbackError } = await supabase.storage
            .from(fallbackBucket)
            .upload(storagePath, file, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (fallbackError) throw fallbackError;
          
          // Get public URL from fallback bucket
          const { data: { publicUrl } } = supabase.storage
            .from(fallbackBucket)
            .getPublicUrl(storagePath);
            
          console.log(`File uploaded successfully to fallback bucket`);
          return publicUrl;
        }
      }
      
      throw error;
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
