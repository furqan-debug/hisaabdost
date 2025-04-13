
import { supabase } from "@/integrations/supabase/client";
import { FileObject } from "@supabase/storage-js";
import { bucketName, checkReceiptsBucketExists } from './bucketOperations';

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
 * Lists all files in the bucket, recursively if necessary
 * @returns Array of file objects with full paths
 */
export async function listAllFiles() {
  console.log(`Listing all files in "${bucketName}" bucket...`);
  
  try {
    // Check if bucket exists first
    const bucketExists = await checkReceiptsBucketExists();
    if (!bucketExists) {
      console.log(`Bucket "${bucketName}" does not exist, no files to list`);
      return [];
    }
    
    // Start by listing files at the root level
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from(bucketName)
      .list('');
      
    if (rootError) {
      console.error("Error listing root files:", rootError);
      return [];
    }
    
    if (!rootFiles || rootFiles.length === 0) {
      console.log("No files found in bucket");
      return [];
    }
    
    // Collect all file paths
    const allFiles: {name: string, path: string, size?: number}[] = [];
    
    // Process files and folders at root level
    for (const item of rootFiles) {
      // Skip null or undefined items
      if (!item) continue;
      
      const name = item.name;
      if (!name) continue;
      
      // If it's a folder, get contents recursively
      if (name.endsWith('/') || (item.id && item.id.endsWith('/'))) {
        try {
          // List files in this folder
          const { data: folderFiles, error: folderError } = await supabase.storage
            .from(bucketName)
            .list(name);
            
          if (!folderError && folderFiles && folderFiles.length > 0) {
            // Add each file in the folder with its full path
            for (const folderFile of folderFiles) {
              if (folderFile && folderFile.name) {
                allFiles.push({
                  name: folderFile.name,
                  path: `${name}${folderFile.name}`,
                  size: folderFile.metadata?.size
                });
              }
            }
          }
        } catch (e) {
          console.error(`Error listing files in folder ${name}:`, e);
        }
      } else {
        // It's a file, add it directly
        allFiles.push({
          name,
          path: name,
          size: item.metadata?.size
        });
      }
    }
    
    console.log(`Found ${allFiles.length} total files in bucket`);
    return allFiles;
  } catch (error) {
    console.error("Error listing all files:", error);
    return [];
  }
}
