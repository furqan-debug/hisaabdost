
import { supabase } from "@/integrations/supabase/client";

// The bucket name your project is using for receipts
const bucketName = "receipts";

/**
 * Lists all files in a user's receipt folder
 * @param userId The user ID to check files for
 * @returns Array of file objects
 */
export async function listUserReceipts(userId: string) {
  if (!userId) {
    console.error("No user ID provided");
    return [];
  }
  
  const folderPath = `${userId}/`;
  console.log(`Checking receipts in folder: ${folderPath}`);
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(folderPath);
    
  if (error) {
    console.error("Error fetching files:", error);
    return [];
  }

  console.log(`Found ${data.length} files for user ${userId}:`, data);
  return data;
}

/**
 * Checks if a specific file exists in Supabase storage
 * @param filePath Full path of the file to check
 * @returns Boolean indicating if file exists
 */
export async function checkFileExists(filePath: string) {
  if (!filePath) {
    console.error("No file path provided");
    return false;
  }
  
  // Extract folder path and file name from the full path
  const lastSlashIndex = filePath.lastIndexOf('/');
  const folderPath = lastSlashIndex > 0 ? filePath.substring(0, lastSlashIndex) : '';
  const fileName = lastSlashIndex > 0 ? filePath.substring(lastSlashIndex + 1) : filePath;
  
  console.log(`Checking if file exists in folder "${folderPath}": ${fileName}`);
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(folderPath);
    
  if (error) {
    console.error("Error fetching files:", error);
    return false;
  }

  // Check if the file exists in the list
  const fileExists = data.some(file => file.name === fileName);
  console.log(`File "${fileName}" exists:`, fileExists);
  return fileExists;
}

/**
 * Gets a public URL for a specific file
 * @param filePath Full path of the file
 * @returns Public URL of the file
 */
export async function getFileUrl(filePath: string) {
  if (!filePath) {
    console.error("No file path provided");
    return null;
  }
  
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
    
  console.log(`Public URL for ${filePath}:`, data.publicUrl);
  return data.publicUrl;
}

/**
 * Creates the receipts bucket if it doesn't exist
 * @returns Boolean indicating success
 */
export async function ensureReceiptsBucketExists() {
  try {
    // Check if receipts bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    
    if (!buckets?.find(bucket => bucket.name === bucketName)) {
      console.log(`Creating "${bucketName}" bucket...`);
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) {
        console.error("Error creating bucket:", error);
        return false;
      }
      
      console.log(`Created "${bucketName}" bucket successfully`);
    } else {
      console.log(`"${bucketName}" bucket already exists`);
    }
    
    return true;
  } catch (error) {
    console.error("Error ensuring bucket exists:", error);
    return false;
  }
}
