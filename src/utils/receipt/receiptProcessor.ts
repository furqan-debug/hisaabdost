
import { toast } from "sonner";
import { ExpenseFormData } from "@/hooks/expense-form/types";
import { uploadToSupabase, generateFileFingerprint } from "./uploadService";
import { canProcessFile, markFileInProgress, markFileComplete, getCachedResult } from "./processingCache";

/**
 * Process a receipt file - upload to storage and return permanent URL
 */
export async function processReceiptFile(
  file: File,
  userId: string | undefined,
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void,
  setIsUploading?: (loading: boolean) => void
): Promise<string | null> {
  try {
    if (!file) {
      console.error("No file provided");
      return null;
    }
    
    // Generate file fingerprint
    const fileFingerprint = generateFileFingerprint(file);
    console.log(`Processing file: ${file.name} (${fileFingerprint})`);
    
    // Check if we can process this file
    if (!canProcessFile(fileFingerprint)) {
      toast.info("Please wait before uploading another file");
      return null;
    }
    
    // Check for cached result
    const cachedUrl = getCachedResult(fileFingerprint);
    if (cachedUrl) {
      console.log(`Using cached URL: ${cachedUrl}`);
      updateField('receiptUrl', cachedUrl);
      return cachedUrl;
    }
    
    // Mark as in progress
    markFileInProgress(fileFingerprint);
    
    if (setIsUploading) setIsUploading(true);
    
    try {
      // Set form with file and clear receiptUrl initially
      updateField('receiptFile', file);
      updateField('receiptUrl', '');
      
      console.log("Starting Supabase upload...");
      const supabaseUrl = await uploadToSupabase(file, userId);
      
      if (supabaseUrl) {
        console.log(`Upload successful: ${supabaseUrl}`);
        
        // Update form with permanent URL
        updateField('receiptUrl', supabaseUrl);
        
        // Cache the result
        markFileComplete(fileFingerprint, supabaseUrl);
        
        toast.success("Receipt uploaded successfully");
        return supabaseUrl;
      } else {
        console.error("Upload failed");
        toast.error("Failed to upload receipt. Please try again.");
        
        // Clear form
        updateField('receiptUrl', '');
        markFileComplete(fileFingerprint);
        
        return null;
      }
    } catch (error) {
      markFileComplete(fileFingerprint);
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
 */
export async function handleReceiptFileChange(
  e: React.ChangeEvent<HTMLInputElement>,
  userId: string | undefined,
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void,
  setIsUploading?: (loading: boolean) => void
): Promise<void> {
  const file = e.target.files?.[0];
  if (!file) {
    console.log("No file selected");
    return;
  }
  
  const fingerprint = generateFileFingerprint(file);
  console.log(`File selected: ${file.name} (${fingerprint})`);
  
  try {
    await processReceiptFile(file, userId, updateField, setIsUploading);
  } catch (error) {
    console.error("File processing error:", error);
    toast.error("Failed to process the receipt file");
  } finally {
    // Reset input to allow same file selection
    e.target.value = '';
  }
}
