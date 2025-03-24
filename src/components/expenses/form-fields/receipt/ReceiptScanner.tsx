
import { useState } from "react";
import { ReceiptScanResult, ScanResult } from "@/hooks/expense-form/types";
import { useReceiptUpload } from "@/hooks/receipt-scanner/useReceiptUpload";
import { useReceiptScanning } from "@/hooks/receipt-scanner/useReceiptScanning";
import { useReceiptProcessing } from "@/hooks/receipt-scanner/useReceiptProcessing";

interface ReceiptScannerProps {
  receiptUrl: string;
  onScanComplete?: (expenseDetails: ScanResult) => void;
  onItemsExtracted?: (receiptData: ReceiptScanResult) => void;
}

export function useReceiptScanner({ 
  receiptUrl, 
  onScanComplete,
  onItemsExtracted 
}: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const { handleUpload } = useReceiptUpload();
  const { scanReceipt } = useReceiptScanning();
  const { processExtractedItems } = useReceiptProcessing({ 
    onScanComplete, 
    onItemsExtracted 
  });

  // Check if we have a receipt image to scan
  const canScanReceipt = !!receiptUrl && !!receiptUrl.match(/\.(jpg|jpeg|png|gif)$/i);

  const handleScanReceipt = async () => {
    // Get file element by id
    const fileInput = document.getElementById('expense-receipt') as HTMLInputElement;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      return;
    }

    setIsScanning(true);
    const file = fileInput.files[0];
    
    try {
      // First upload to Supabase storage to get a permanent URL
      let storageUrl = receiptUrl;
      if (!receiptUrl.includes('supabase.co')) {
        const uploadedUrl = await handleUpload(file);
        if (uploadedUrl) {
          storageUrl = uploadedUrl;
        }
      }
      
      await scanReceipt(file, storageUrl);
    } catch (error) {
      console.error("Receipt scanning error:", error);
    } finally {
      setIsScanning(false);
    }
  };

  return {
    isScanning,
    canScanReceipt,
    handleScanReceipt
  };
}
