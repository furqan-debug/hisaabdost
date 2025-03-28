
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
// Using a more robust implementation with timestamps and processing status
const processedFiles = new Map<string, { 
  timestamp: number, 
  inProgress: boolean,
  receiptUrl?: string 
}>();

// Rate limiting: avoid processing more than one file per second
let lastProcessTime = 0;
const MIN_PROCESS_INTERVAL = 1000; // 1 second

// Cleanup old cache entries every minute
setInterval(() => {
  const now = Date.now();
  const expirationTime = 30 * 60 * 1000; // 30 minutes
  
  for (const [fingerprint, data] of processedFiles.entries()) {
    if (now - data.timestamp > expirationTime) {
      console.log(`Removing expired cache entry: ${fingerprint}`);
      processedFiles.delete(fingerprint);
    }
  }
}, 60000);

/**
 * Generate a robust file fingerprint
 */
export function generateFileFingerprint(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

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
    // Check basic validity
    if (!file) {
      console.error("No file provided to processReceiptFile");
      return null;
    }
    
    // Only allow images
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return null;
    }
    
    // Generate file fingerprint
    const fileFingerprint = generateFileFingerprint(file);
    
    // Implement rate limiting
    const now = Date.now();
    if (now - lastProcessTime < MIN_PROCESS_INTERVAL) {
      console.log(`Rate limiting applied, request too soon after last process`);
      toast.warning("Please wait a moment before uploading another file");
      return null;
    }
    lastProcessTime = now;
    
    // Check if we've already processed this exact file recently
    // or if a processing operation is in progress
    const fileData = processedFiles.get(fileFingerprint);
    if (fileData) {
      if (fileData.inProgress) {
        console.log(`File processing already in progress: ${fileFingerprint}`);
        toast.info("This file is already being processed");
        return null;
      }
      
      const timeSinceLastProcess = now - fileData.timestamp;
      if (timeSinceLastProcess < 10000) { // 10 seconds
        console.log(`File already processed recently (${timeSinceLastProcess}ms ago): ${fileFingerprint}`);
        
        // If we have a saved receipt URL, return it immediately
        if (fileData.receiptUrl) {
          console.log(`Using cached receipt URL: ${fileData.receiptUrl}`);
          updateField('receiptUrl', fileData.receiptUrl);
          return fileData.receiptUrl;
        }
        
        return null;
      }
    }
    
    console.log(`Processing receipt file: ${file.name} (${file.size} bytes), fingerprint: ${fileFingerprint}`);
    
    // Mark as in progress and update timestamp
    processedFiles.set(fileFingerprint, { 
      timestamp: now, 
      inProgress: true 
    });
    
    if (setIsUploading) setIsUploading(true);
    
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
        const supabaseUrl = await uploadToSupabase(file, userId);
        
        // If upload was successful, update the form with the permanent URL
        if (supabaseUrl) {
          console.log(`Updating receipt URL from blob to Supabase URL: ${supabaseUrl}`);
          
          // Mark the blob URL for cleanup, but don't revoke it immediately
          // in case it's still being displayed
          markBlobUrlForCleanup(localUrl);
          // And mark again for the reference we added above
          markBlobUrlForCleanup(localUrl);
          
          updateField('receiptUrl', supabaseUrl);
          
          // Update the processed files map to indicate successful processing
          // and store the final URL for potential reuse
          processedFiles.set(fileFingerprint, { 
            timestamp: Date.now(), 
            inProgress: false,
            receiptUrl: supabaseUrl 
          });
          
          return supabaseUrl;
        } else {
          console.log("Using local blob URL as fallback since Supabase upload failed");
          // Remove the extra reference as we're keeping the blob URL
          markBlobUrlForCleanup(localUrl);
          
          // Update processed files map with failure status but keep the blob URL
          processedFiles.set(fileFingerprint, { 
            timestamp: Date.now(), 
            inProgress: false,
            receiptUrl: localUrl 
          });
          
          return localUrl;
        }
      } catch (error) {
        console.error("Upload error:", error);
        // Remove the extra reference since upload failed
        markBlobUrlForCleanup(localUrl);
        
        // Mark as processed but not in progress
        processedFiles.set(fileFingerprint, { 
          timestamp: Date.now(), 
          inProgress: false,
          receiptUrl: localUrl 
        });
        
        return localUrl;
      } finally {
        // Clean up any unused blob URLs after a delay
        setTimeout(cleanupUnusedBlobUrls, 2000);
      }
    } catch (error) {
      // Mark as no longer in progress in case of error
      processedFiles.set(fileFingerprint, { 
        timestamp: Date.now(), 
        inProgress: false 
      });
      throw error;
    } finally {
      if (setIsUploading) setIsUploading(false);
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
