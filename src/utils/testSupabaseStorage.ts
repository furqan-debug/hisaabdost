
import { supabase } from "@/integrations/supabase/client";
import { FileObject } from "@supabase/storage-js";

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
  
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath);
      
    if (error) {
      // Handle error but don't block functionality
      console.error("Error fetching files:", error);
      return [];
    }

    console.log(`Found ${data.length} files for user ${userId}`);
    return data;
  } catch (error) {
    console.error("Error listing receipts:", error);
    return [];
  }
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
  
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath);
      
    if (error) {
      // Handle error but don't block functionality
      console.error("Error fetching files:", error);
      return false;
    }

    // Check if the file exists in the list
    const fileExists = data.some(file => file.name === fileName);
    console.log(`File "${fileName}" exists:`, fileExists);
    return fileExists;
  } catch (error) {
    console.error("Error checking if file exists:", error);
    return false;
  }
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

/**
 * Simplified method to delete all files in the bucket
 * This avoids the null.endsWith error by using a more direct approach
 * @returns Object with counts of deleted and failed files
 */
export async function deleteAllFiles() {
  console.log(`Starting permanent deletion of all files in "${bucketName}" bucket...`);
  
  try {
    // First check if bucket exists
    const bucketExists = await checkReceiptsBucketExists();
    if (!bucketExists) {
      console.log(`Bucket "${bucketName}" does not exist, nothing to delete`);
      return { deleted: 0, failed: 0 };
    }
    
    // Try to list files at the root level first
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from(bucketName)
      .list('');
      
    if (rootError) {
      console.error("Error listing root files:", rootError);
      return { deleted: 0, failed: 0 };
    }
    
    if (!rootFiles || rootFiles.length === 0) {
      console.log("No files found to delete");
      return { deleted: 0, failed: 0 };
    }
    
    // Collect all file paths that need to be deleted
    const allFilePaths: string[] = [];
    
    // Process files at the root level
    for (const item of rootFiles) {
      // Skip null or undefined items
      if (!item) continue;
      
      const name = item.name;
      if (!name) continue;
      
      // If it's a folder (ends with '/'), we need to get its contents
      if (name.endsWith('/') || (item.id && item.id.endsWith('/'))) {
        try {
          // List files in this folder
          const { data: folderFiles, error: folderError } = await supabase.storage
            .from(bucketName)
            .list(name);
            
          if (!folderError && folderFiles && folderFiles.length > 0) {
            // Add each file in the folder to the delete list
            for (const folderFile of folderFiles) {
              if (folderFile && folderFile.name) {
                allFilePaths.push(`${name}${folderFile.name}`);
              }
            }
          }
        } catch (e) {
          console.error(`Error listing files in folder ${name}:`, e);
        }
      } else {
        // It's a file, add it directly
        allFilePaths.push(name);
      }
    }
    
    if (allFilePaths.length === 0) {
      console.log("No valid files found to delete");
      return { deleted: 0, failed: 0 };
    }
    
    console.log(`Found ${allFilePaths.length} files to delete`);
    
    // Delete files in batches to avoid overwhelming the API
    const batchSize = 100;
    let deletedCount = 0;
    let failedCount = 0;
    
    for (let i = 0; i < allFilePaths.length; i += batchSize) {
      const batch = allFilePaths.slice(i, Math.min(i + batchSize, allFilePaths.length));
      console.log(`Processing deletion batch ${Math.floor(i/batchSize) + 1}, deleting ${batch.length} files`);
      
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .remove(batch);
          
        if (error) {
          console.error(`Error in batch deletion:`, error);
          failedCount += batch.length;
        } else {
          deletedCount += batch.length;
        }
      } catch (e) {
        console.error(`Error processing batch:`, e);
        failedCount += batch.length;
      }
    }
    
    console.log(`Deletion complete. ${deletedCount} files permanently deleted, ${failedCount} files failed`);
    return { deleted: deletedCount, failed: failedCount };
  } catch (error) {
    console.error("Error in deleteAllFiles:", error);
    return { deleted: 0, failed: 0, error: error.message };
  }
}
