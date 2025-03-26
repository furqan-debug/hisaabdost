import { toast } from "sonner";
import { createManagedBlobUrl, markBlobUrlForCleanup, cleanupUnusedBlobUrls } from "./blobUrlManager";
import { uploadToSupabase } from "./supabaseUploader";
import { ExpenseFormData } from "@/hooks/expense-form/types";

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
    
    // Create local blob URL for preview
    const localUrl = createManagedBlobUrl(file);
    
    // Clean up previous blob URL if it exists but after a delay
    if (currentBlobUrl) {
      markBlobUrlForCleanup(currentBlobUrl);
    }
    
    // Update form with local URL for immediate preview
    updateField('receiptUrl', localUrl);
    updateField('receiptFile', file);
    
    // Attempt to upload to Supabase and get permanent URL
    const supabaseUrl = await uploadToSupabase(file, userId, setIsUploading);
    
    // If upload was successful, update the form with the permanent URL
    if (supabaseUrl) {
      console.log("Updating receipt URL from blob to Supabase URL");
      
      // Mark the blob URL for cleanup, but don't revoke it immediately
      // in case it's still being displayed
      markBlobUrlForCleanup(localUrl);
      
      updateField('receiptUrl', supabaseUrl);
    } else {
      console.log("Using local blob URL as fallback since Supabase upload failed");
      // Keep the blob URL active as we're using it
    }
    
    // Clean up any unused blob URLs after a short delay
    setTimeout(cleanupUnusedBlobUrls, 2000);
    
    return supabaseUrl || localUrl;
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
  if (file) {
    await processReceiptFile(file, userId, currentBlobUrl, updateField, setIsUploading);
    
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  }
}
