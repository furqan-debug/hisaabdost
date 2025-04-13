
import { supabase } from "@/integrations/supabase/client";
import { bucketName, checkReceiptsBucketExists } from './bucketOperations';

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
