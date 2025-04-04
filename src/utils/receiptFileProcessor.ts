
import { toast } from "sonner";
import { markBlobUrlForCleanup } from "./blobUrlManager";
import { supabase } from "@/integrations/supabase/client";

/**
 * Generate a unique fingerprint for a file to prevent duplicate processing
 */
export function generateFileFingerprint(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

/**
 * Process a receipt file and extract expense information
 */
export async function processReceiptFile(
  file: File,
  userId?: string,
  existingUrl?: string | null,
  updateField?: (field: string, value: any) => void,
  setIsUploading?: (isUploading: boolean) => void
): Promise<string | null> {
  console.log(`Processing receipt file: ${file.name} (${file.size} bytes)`);
  
  if (setIsUploading) {
    setIsUploading(true);
  }
  
  try {
    // Create a blob URL for the file
    const previewUrl = URL.createObjectURL(file);
    
    // If we have an updateField function, update the form with the file
    if (updateField) {
      updateField('receiptFile', file);
      updateField('receiptUrl', previewUrl);
    }
    
    // Track the blob URL for cleanup
    markBlobUrlForCleanup(previewUrl);
    
    // If we have an existing URL, revoke it to prevent memory leaks
    if (existingUrl && existingUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(existingUrl);
      } catch (error) {
        console.error("Error revoking old blob URL:", error);
      }
    }
    
    // Store the file in Supabase Storage if we have a user ID
    if (userId) {
      try {
        console.log("Uploading receipt to Supabase Storage...");
        
        // Random file name to avoid collisions
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('receipts')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error("Error uploading file to Supabase:", error);
          // We'll just use the blob URL if upload fails
        } else if (data) {
          console.log("File uploaded successfully:", data);
          
          // Get the public URL for the file
          const { data: publicUrlData } = supabase.storage
            .from('receipts')
            .getPublicUrl(fileName);
          
          if (publicUrlData && publicUrlData.publicUrl) {
            // If we have an updateField function, update the form with the public URL
            if (updateField) {
              updateField('receiptUrl', publicUrlData.publicUrl);
            }
            
            console.log("Public URL created:", publicUrlData.publicUrl);
            
            // Return the public URL
            return publicUrlData.publicUrl;
          }
        }
      } catch (uploadError) {
        console.error("Exception during file upload:", uploadError);
        // Continue with blob URL if upload fails
      }
    }
    
    // Return the blob URL if we didn't upload to Supabase
    return previewUrl;
  } catch (error) {
    console.error("Error processing receipt file:", error);
    toast.error("Failed to process receipt image");
    return null;
  } finally {
    if (setIsUploading) {
      setIsUploading(false);
    }
  }
}
