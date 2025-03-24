
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a receipt file to Supabase storage
 * @param file The file to upload
 * @returns The public URL of the uploaded file or null if upload failed
 */
export async function uploadReceipt(file: File) {
  console.log("Uploading receipt to Supabase:", file.name, file.type, file.size);
  
  if (!file) {
    console.error("No file provided for upload");
    return null;
  }
  
  // Generate a unique file name to prevent collisions
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `receipts/${fileName}`;
  
  // Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from("receipts")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Receipt upload failed:", error);
    return null;
  } else {
    console.log("Receipt uploaded successfully:", data);
    
    // Get the public URL for the file
    const { data: publicUrlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(filePath);
      
    return publicUrlData.publicUrl;
  }
}
