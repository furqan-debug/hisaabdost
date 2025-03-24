
import { useState, useCallback } from "react";
import { useScanState } from "./useScanState";
import { useScanProcess } from "./useScanProcess";
import { useScanResults } from "./useScanResults";
import { supabase } from "@/integrations/supabase/client";

interface UseScanReceiptProps {
  file: File | null;
  onCleanup: () => void;
  onCapture?: (expenseDetails: any) => void;
  autoSave?: boolean;
  setOpen: (open: boolean) => void;
}

export function useScanReceipt({
  file,
  onCleanup,
  onCapture,
  autoSave = false,
  setOpen
}: UseScanReceiptProps) {
  const {
    isScanning, 
    scanProgress, 
    scanTimedOut,
    startScan,
    endScan,
    updateProgress,
    timeoutScan
  } = useScanState();
  
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  // Handle the actual scanning process
  const processScan = useScanProcess({
    updateProgress,
    endScan,
    timeoutScan
  });
  
  // Handle scan results
  useScanResults({
    isScanning,
    scanTimedOut,
    autoSave,
    onCapture,
    setOpen,
    onCleanup
  });

  // Start the scan process
  const handleScanReceipt = useCallback(async () => {
    if (!file || isScanning) return;
    
    startScan();
    
    try {
      // First upload the file to Supabase storage if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      let fileUrl = null;
      
      if (user) {
        updateProgress(10, "Uploading receipt...");
        
        // Upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const filePath = `receipts/${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, file, { upsert: true });
          
        if (uploadError) {
          console.error("Error uploading receipt to storage:", uploadError);
        } else if (uploadData) {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('receipts')
            .getPublicUrl(filePath);
            
          fileUrl = urlData.publicUrl;
          setReceiptUrl(fileUrl);
          console.log("Receipt uploaded to:", fileUrl);
        }
      }
      
      // Now process the image with OCR
      updateProgress(20, "Processing receipt...");
      
      // Create form data with the image and optional URL
      const formData = new FormData();
      formData.append('receipt', file);
      
      // Add the URL if we have it
      if (fileUrl) {
        formData.append('receiptUrl', fileUrl);
      }
      
      await processScan(formData);
      
    } catch (error) {
      console.error("Error in scan process:", error);
      endScan();
    }
  }, [file, isScanning, startScan, updateProgress, processScan, endScan]);

  return {
    isScanning,
    scanProgress,
    scanTimedOut,
    handleScanReceipt,
    receiptUrl
  };
}
