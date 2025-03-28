import { toast } from "sonner";
import { 
  createManagedBlobUrl, 
  markBlobUrlForCleanup, 
  cleanupUnusedBlobUrls, 
  addBlobUrlReference 
} from "./blobUrlManager";
import { uploadToSupabase } from "./supabaseUploader";
import { ExpenseFormData } from "@/hooks/expense-form/types";

// Cache to prevent duplicate processing of the same file
// Using a more robust implementation with timestamps for expiration
const processedFiles = new Map<string, { timestamp: number, inProgress: boolean }>();

// Cleanup old cache entries every minute
setInterval(() => {
  const now = Date.now();
  const expirationTime = 5 * 60 * 1000; // 5 minutes
  
  for (const [fingerprint, data] of processedFiles.entries()) {
    if (now - data.timestamp > expirationTime) {
      processedFiles.delete(fingerprint);
    }
  }
}, 60000);

/**
 * Process a receipt file - create local preview and upload to storage
 * @param file The receipt file to process
 * @param userId The user ID for storage paths
 * @param currentBlobUrl Reference to the current blob URL
 * @param updateField Function to update form fields
 * @param setIsUploading Function to update loading state
 * @returns Promise resolving to the Supabase URL or null
 */
export async function processReceiptFile(
  file: File,
  userId: string | undefined,
  currentBlobUrl: string | null,
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void,
  setIsUploading?: (loading: boolean) => void
): Promise<string | null> {
  try {
    // Only allow images
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return null;
    }
    
    // Generate file fingerprint
    const fileFingerprint = `${file.name}-${file.size}-${file.lastModified}`;
    
    // Check if we've already processed this exact file recently
    // or if a processing operation is in progress
    const fileData = processedFiles.get(fileFingerprint);
    if (fileData) {
      if (fileData.inProgress) {
        console.log(`File processing already in progress: ${fileFingerprint}`);
        return null;
      }
      
      const now = Date.now();
      const timeSinceLastProcess = now - fileData.timestamp;
      if (timeSinceLastProcess < 5000) { // 5 seconds
        console.log(`File already processed recently (${timeSinceLastProcess}ms ago): ${fileFingerprint}`);
        return null;
      }
    }
    
    console.log(`Processing receipt file: ${file.name} (${file.size} bytes), fingerprint: ${fileFingerprint}`);
    
    // Mark as in progress
    processedFiles.set(fileFingerprint, { timestamp: Date.now(), inProgress: true });
    
    try {
      // Create local blob URL for preview
      const localUrl = createManagedBlobUrl(file);
      
      // Clean up previous blob URL if it exists but after a delay
      if (currentBlobUrl) {
        console.log(`Marking previous URL for cleanup: ${currentBlobUrl}`);
        // Wait a bit before marking for cleanup to avoid flickering
        setTimeout(() => {
          markBlobUrlForCleanup(currentBlobUrl);
        }, 500);
      }
      
      // Update form with local URL for immediate preview
      updateField('receiptUrl', localUrl);
      updateField('receiptFile', file);
      
      // Add an extra reference to keep the blob URL alive during the upload
      addBlobUrlReference(localUrl);
      
      try {
        // Attempt to upload to Supabase and get permanent URL
        const supabaseUrl = await uploadToSupabase(file, userId, setIsUploading);
        
        // If upload was successful, update the form with the permanent URL
        if (supabaseUrl) {
          console.log("Updating receipt URL from blob to Supabase URL");
          
          // Mark the blob URL for cleanup, but don't revoke it immediately
          // in case it's still being displayed
          markBlobUrlForCleanup(localUrl);
          // And mark again for the reference we added above
          markBlobUrlForCleanup(localUrl);
          
          updateField('receiptUrl', supabaseUrl);
          
          // Update the processed files map to indicate successful processing
          processedFiles.set(fileFingerprint, { timestamp: Date.now(), inProgress: false });
          
          return supabaseUrl;
        } else {
          console.log("Using local blob URL as fallback since Supabase upload failed");
          // Remove the extra reference as we're keeping the blob URL
          markBlobUrlForCleanup(localUrl);
          
          // Update processed files map with failure status
          processedFiles.set(fileFingerprint, { timestamp: Date.now(), inProgress: false });
          
          return localUrl;
        }
      } catch (error) {
        console.error("Upload error:", error);
        // Remove the extra reference since upload failed
        markBlobUrlForCleanup(localUrl);
        
        // Mark as processed but not in progress
        processedFiles.set(fileFingerprint, { timestamp: Date.now(), inProgress: false });
        
        return localUrl;
      } finally {
        // Clean up any unused blob URLs after a delay
        setTimeout(cleanupUnusedBlobUrls, 2000);
      }
    } catch (error) {
      // Mark as no longer in progress in case of error
      processedFiles.set(fileFingerprint, { timestamp: Date.now(), inProgress: false });
      throw error;
    }
  } catch (error) {
    console.error("Error processing receipt file:", error);
    toast.error('Failed to process receipt file');
    return null;
  }
}

/**
 * Handle file input change event
 * @param e The change event from the file input
 * @param userId The user ID for storage paths
 * @param currentBlobUrl Reference to the current blob URL
 * @param updateField Function to update form fields
 * @param setIsUploading Function to update loading state
 * @returns Promise resolving when processing is complete
 */
export async function handleReceiptFileChange(
  e: React.ChangeEvent<HTMLInputElement>,
  userId: string | undefined,
  currentBlobUrl: string | null,
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void,
  setIsUploading?: (loading: boolean) => void
): Promise<void> {
  const file = e.target.files?.[0];
  if (!file) {
    console.log("No file selected");
    return;
  }
  
  console.log(`File selected: ${file.name} (${file.size} bytes, type: ${file.type})`);
  
  try {
    await processReceiptFile(file, userId, currentBlobUrl, updateField, setIsUploading);
  } catch (error) {
    console.error("File processing error:", error);
    toast.error("Failed to process the receipt file");
  } finally {
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  }
}
