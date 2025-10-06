
import { toast } from "sonner";
import { ExpenseFormData } from "@/hooks/expense-form/types";
import { generateFileFingerprint } from "./uploadService";
import { canProcessFile, markFileInProgress, markFileComplete, getCachedResult } from "./processingCache";

/**
 * Process a receipt file in-memory without uploading to storage
 * Returns a temporary blob URL for preview only
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
    
    console.log(`processReceiptFile: Processing ${file.name} (${file.size} bytes) in memory`);
    
    // Analyze image quality before processing
    try {
      const { analyzeImageQuality } = await import('./qualityDetection');
      const qualityAnalysis = await analyzeImageQuality(file);
      
      console.log(`📊 Image quality analysis:`, qualityAnalysis);
      
      // Log warnings for poor quality but don't block
      if (!qualityAnalysis.isAcceptable) {
        console.warn(`⚠️ Image quality is below optimal (score: ${qualityAnalysis.score})`);
        qualityAnalysis.issues.forEach(issue => {
          console.warn(`  - ${issue.message}: ${issue.suggestion}`);
        });
      }
    } catch (error) {
      console.warn('Quality analysis failed, continuing anyway:', error);
    }
    
    // Generate file fingerprint
    const fileFingerprint = generateFileFingerprint(file);
    
    // Check if we can process this file
    if (!canProcessFile(fileFingerprint)) {
      toast.info("Please wait before processing another file");
      return null;
    }
    
    // Check for cached result
    const cachedUrl = getCachedResult(fileFingerprint);
    if (cachedUrl) {
      console.log(`Using cached blob URL: ${cachedUrl}`);
      updateField('receiptUrl', cachedUrl);
      return cachedUrl;
    }
    
    // Mark as in progress
    markFileInProgress(fileFingerprint);
    
    if (setIsUploading) setIsUploading(true);
    
    try {
      // Set form with file first
      updateField('receiptFile', file);
      
      // Create temporary blob URL for preview (will be cleaned up after scanning)
      const blobUrl = URL.createObjectURL(file);
      console.log(`Created temporary blob URL for preview: ${blobUrl}`);
      
      updateField('receiptUrl', blobUrl);
      markFileComplete(fileFingerprint, blobUrl);
      
      // Don't show success toast for auto-processing - let the scan dialog handle it
      return blobUrl;
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
