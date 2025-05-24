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
        
        // Only return cached URL if it's a permanent Supabase URL
        if (fileData.receiptUrl && !fileData.receiptUrl.startsWith('blob:') && fileData.receiptUrl.includes('supabase')) {
          console.log(`Using cached Supabase URL: ${fileData.receiptUrl}`);
          updateField('receiptUrl', fileData.receiptUrl);
          return fileData.receiptUrl;
        }
        
        return null;
      }
    }
    
    console.log(`Processing receipt file: ${file.name} (${file.size} bytes), fingerprint: ${fileFingerprint}`);
    
    // Mark as in progress
    processedFiles.set(fileFingerprint, { 
      timestamp: now, 
      inProgress: true 
    });
    
    if (setIsUploading) setIsUploading(true);
    
    try {
      // Create local blob URL for immediate preview only
      const localUrl = createManagedBlobUrl(file);
      
      // Clean up previous blob URL if it exists
      if (currentBlobUrl && currentBlobUrl.startsWith('blob:')) {
        console.log(`Marking previous blob URL for cleanup: ${currentBlobUrl}`);
        setTimeout(() => {
          markBlobUrlForCleanup(currentBlobUrl);
        }, 500);
      }
      
      // Set form with file but NOT the blob URL in receiptUrl
      updateField('receiptFile', file);
      
      // Show a temporary preview by setting receiptUrl to the blob URL temporarily
      // This will be replaced with the permanent URL once upload completes
      updateField('receiptUrl', localUrl);
      
      try {
        // Upload to Supabase and get permanent URL
        const supabaseUrl = await uploadToSupabase(file, userId);
        
        if (supabaseUrl) {
          console.log(`Successfully uploaded to Supabase: ${supabaseUrl}`);
          
          // Clean up the blob URL since we have a permanent URL
          markBlobUrlForCleanup(localUrl);
          
          // Update form with the permanent Supabase URL
          updateField('receiptUrl', supabaseUrl);
          
          // Cache the permanent URL
          processedFiles.set(fileFingerprint, { 
            timestamp: Date.now(), 
            inProgress: false,
            receiptUrl: supabaseUrl 
          });
          
          return supabaseUrl;
        } else {
          // Upload failed - clear the receipt URL completely
          console.error("Supabase upload failed, clearing receipt URL");
          toast.error("Failed to upload receipt. Please try again.");
          
          // Clean up the blob URL
          markBlobUrlForCleanup(localUrl);
          
          // Clear the receipt URL from the form (don't store blob URLs)
          updateField('receiptUrl', '');
          
          // Mark as processed but failed
          processedFiles.set(fileFingerprint, { 
            timestamp: Date.now(), 
            inProgress: false
          });
          
          return null;
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload receipt. Please try again.");
        
        // Clean up the blob URL
        markBlobUrlForCleanup(localUrl);
        
        // Clear the receipt URL from the form
        updateField('receiptUrl', '');
        
        // Mark as processed but failed
        processedFiles.set(fileFingerprint, { 
          timestamp: Date.now(), 
          inProgress: false
        });
        
        return null;
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
  
  const fingerprint = generateFileFingerprint(file);
  console.log(`File selected: ${file.name} (${file.size} bytes, type: ${file.type}), fingerprint: ${fingerprint}`);
  
  // Check if this file is already being processed
  if (processedFiles.has(fingerprint) && processedFiles.get(fingerprint)?.inProgress) {
    console.log(`File is already being processed: ${fingerprint}`);
    toast.info("This file is already being processed");
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
    return;
  }
  
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
