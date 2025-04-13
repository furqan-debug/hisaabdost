
import { supabase } from "@/integrations/supabase/client";
import { bucketName } from './bucketOperations';

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
