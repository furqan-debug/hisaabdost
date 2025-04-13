
import { supabase } from "@/integrations/supabase/client";

// The bucket name your project is using for receipts
export const bucketName = 'receipts';

/**
 * Checks if the receipts bucket exists
 * @returns Boolean indicating if the bucket exists
 */
export async function checkReceiptsBucketExists() {
  try {
    // First try a simple list operation with a very short timeout
    const listPromise = supabase.storage.from(bucketName).list('', { limit: 1 });
    
    // Add a timeout to the request
    const timeoutPromise = new Promise<{data: null, error: Error}>((resolve) => {
      setTimeout(() => {
        resolve({
          data: null, 
          error: new Error('Bucket check timed out')
        });
      }, 3000);
    });
    
    // Use the result of whichever finishes first
    const { error } = await Promise.race([listPromise, timeoutPromise]);
    
    if (!error) {
      console.log(`"${bucketName}" bucket exists and is accessible`);
      return true;
    }
    
    // If the simple check fails, try getting bucket information
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error("Error listing buckets:", bucketError);
      // Continue anyway to avoid blocking receipt uploads
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (bucketExists) {
      console.log(`"${bucketName}" bucket exists`);
      return true;
    } else {
      console.log(`"${bucketName}" bucket does not exist`);
      return false;
    }
  } catch (error) {
    console.error("Error checking if bucket exists:", error);
    return false;
  }
}

/**
 * Creates the receipts bucket if it doesn't exist
 * @returns Boolean indicating success
 */
export async function createReceiptsBucket() {
  try {
    // Check if bucket exists first
    const exists = await checkReceiptsBucketExists();
    if (exists) {
      console.log(`Bucket "${bucketName}" already exists`);
      return true;
    }
    
    // Create the bucket with public access
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB limit
    });
    
    if (error) {
      // Check if error is just that the bucket already exists
      if (error.message && error.message.includes("already exists")) {
        console.log(`Bucket "${bucketName}" already exists`);
        return true;
      }
      
      console.error(`Error creating "${bucketName}" bucket:`, error);
      return false;
    }
    
    console.log(`Successfully created "${bucketName}" bucket`);
    return true;
  } catch (error) {
    console.error(`Error creating "${bucketName}" bucket:`, error);
    return false;
  }
}
