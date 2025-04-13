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
 * Lists all files in the entire bucket (across all folders)
 * @returns Array of file objects with their full paths
 */
export async function listAllFiles() {
  console.log(`Listing all files in "${bucketName}" bucket...`);
  
  try {
    // First check if bucket exists
    const bucketExists = await checkReceiptsBucketExists();
    if (!bucketExists) {
      console.log(`Bucket "${bucketName}" does not exist, nothing to list`);
      return [];
    }
    
    // Start with root level
    const { data: rootItems, error: rootError } = await supabase.storage
      .from(bucketName)
      .list('');
      
    if (rootError) {
      console.error("Error listing root files:", rootError);
      return [];
    }
    
    // Process all folders and files
    const allFiles: {name: string, fullPath: string, size: number}[] = [];
    
    // Process files at root level
    const rootFiles = rootItems.filter(item => !item.id.endsWith('/'));
    rootFiles.forEach(file => {
      allFiles.push({
        name: file.name,
        fullPath: file.name,
        size: file.metadata?.size || 0
      });
    });
    
    // Process folders (recursively)
    const rootFolders = rootItems
      .filter(item => item.id.endsWith('/'))
      .map(folder => folder.name);
      
    for (const folder of rootFolders) {
      const folderFiles = await listFolderRecursively(folder);
      allFiles.push(...folderFiles);
    }
    
    console.log(`Found ${allFiles.length} total files across all folders`);
    return allFiles;
  } catch (error) {
    console.error("Error listing all files:", error);
    return [];
  }
}

/**
 * Helper function to recursively list files in a folder and its subfolders
 */
async function listFolderRecursively(folderPath: string): Promise<{name: string, fullPath: string, size: number}[]> {
  const allFiles: {name: string, fullPath: string, size: number}[] = [];
  console.log(`Listing files in folder: ${folderPath}`);
  
  try {
    const { data: items, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath);
      
    if (error) {
      console.error(`Error listing files in folder ${folderPath}:`, error);
      return allFiles;
    }
    
    // Process files in this folder
    const files = items.filter(item => !item.id.endsWith('/'));
    files.forEach(file => {
      allFiles.push({
        name: file.name,
        fullPath: `${folderPath}/${file.name}`,
        size: file.metadata?.size || 0
      });
    });
    
    // Process subfolders recursively
    const subfolders = items
      .filter(item => item.id.endsWith('/'))
      .map(folder => folder.name);
      
    for (const subfolder of subfolders) {
      const subfolderPath = `${folderPath}/${subfolder}`;
      const subfolderFiles = await listFolderRecursively(subfolderPath);
      allFiles.push(...subfolderFiles);
    }
    
    return allFiles;
  } catch (error) {
    console.error(`Error in recursive listing for ${folderPath}:`, error);
    return allFiles;
  }
}

/**
 * Permanently deletes all files in the bucket across all folders
 * No confirmation needed - this is a permanent operation
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
    
    // Get list of all files
    const allFiles = await listAllFiles();
    if (allFiles.length === 0) {
      console.log("No files found to delete");
      return { deleted: 0, failed: 0 };
    }
    
    console.log(`Found ${allFiles.length} files to permanently delete`);
    
    // Batch files in groups to avoid overwhelming the API
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < allFiles.length; i += batchSize) {
      batches.push(allFiles.slice(i, i + batchSize));
    }
    
    let deletedCount = 0;
    let failedCount = 0;
    
    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing deletion batch ${i+1}/${batches.length} (${batch.length} files)`);
      
      const filePaths = batch.map(file => file.fullPath);
      const { data, error } = await supabase.storage
        .from(bucketName)
        .remove(filePaths);
        
      if (error) {
        console.error(`Error in batch ${i+1} deletion:`, error);
        failedCount += batch.length;
        continue;
      }
      
      // Check individual results if returned
      if (data && Array.isArray(data)) {
        // With the updated Supabase SDK, we need to check the returned data structure
        // The data is now an array of objects, each representing a file operation result
        
        // Count successful deletions (files without errors)
        const successCount = data.filter(result => !('error' in result)).length;
        // Count failed deletions (files with errors)
        const errorCount = data.length - successCount;
        
        deletedCount += successCount;
        failedCount += errorCount;
        
        console.log(`Batch ${i+1} results: ${successCount} deleted, ${errorCount} failed`);
      } else {
        // If no detailed results, assume all succeeded
        deletedCount += batch.length;
        console.log(`Batch ${i+1}: Assuming all ${batch.length} files were deleted`);
      }
    }
    
    console.log(`Deletion complete. ${deletedCount} files permanently deleted, ${failedCount} files failed`);
    return { deleted: deletedCount, failed: failedCount };
  } catch (error) {
    console.error("Error in deleteAllFiles:", error);
    return { deleted: 0, failed: 0, error: error.message };
  }
}

/**
 * Immediately executes deletion of all files in Supabase storage
 * This function runs as soon as this module is imported
 */
(async function executeImmediateStorageCleanup() {
  console.log("EXECUTING IMMEDIATE STORAGE CLEANUP: Deleting all files from Supabase storage...");
  try {
    const result = await deleteAllFiles();
    console.log(`Storage cleanup complete: Permanently deleted ${result.deleted} files. Failed: ${result.failed}`);
    return result;
  } catch (error) {
    console.error("ERROR during storage cleanup:", error);
    return { deleted: 0, failed: 0, error: error.message };
  }
})();
