
import { useCallback, useEffect, useState } from "react";
import { useScanState } from "./useScanState";
import { useScanProcess } from "./useScanProcess";
import { useScanResults } from "./useScanResults";
import { toast } from "sonner";

interface UseScanReceiptProps {
  file: File | null;
  onCleanup: () => void;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
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
  // Use the scan state hook for managing state
  const { 
    isScanning, 
    scanProgress, 
    scanTimedOut,
    scanError,
    statusMessage,
    startScan,
    endScan,
    updateProgress,
    timeoutScan,
    errorScan
  } = useScanState();
  
  // Add state for auto-processing
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);

  // Use the process scan hook for actually processing the scan
  const processScan = useScanProcess({
    updateProgress,
    endScan,
    timeoutScan,
    errorScan
  });

  // Handle scan results
  useScanResults({
    isScanning,
    scanTimedOut,
    scanError,
    autoSave,
    onCapture,
    setOpen,
    onCleanup
  });

  // Validate the receipt file
  const validateReceiptFile = useCallback((file: File): boolean => {
    // Validate file size
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File is too large. Please use an image under 10MB.");
      return false;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please use JPEG, PNG, HEIC or PDF.");
      return false;
    }
    
    return true;
  }, []);

  // Process scan with common logic
  const processScanWithCommonLogic = useCallback(async (isAuto: boolean) => {
    if (!file) {
      toast.error("No receipt file selected.");
      return;
    }
    
    if (!validateReceiptFile(file)) {
      return;
    }

    try {
      if (isAuto) {
        setIsAutoProcessing(true);
        updateProgress(10, "Auto-processing receipt...");
      } else {
        startScan();
      }
      
      // Create FormData with receipt file
      const formData = new FormData();
      formData.append('receipt', file);
      
      // Process the scan
      await processScan(formData);
      
      if (isAuto) {
        setIsAutoProcessing(false);
      }
    } catch (error) {
      console.error("Error in processScanWithCommonLogic:", error);
      errorScan("An unexpected error occurred during scanning.");
      if (isAuto) {
        setIsAutoProcessing(false);
      }
    }
  }, [file, startScan, processScan, errorScan, validateReceiptFile, updateProgress]);

  // Handle manual scan button click
  const handleScanReceipt = useCallback(() => {
    processScanWithCommonLogic(false);
  }, [processScanWithCommonLogic]);
  
  // Handle automatic processing
  const autoProcessReceipt = useCallback(() => {
    processScanWithCommonLogic(true);
  }, [processScanWithCommonLogic]);

  return {
    isScanning,
    scanProgress,
    scanTimedOut,
    scanError,
    statusMessage,
    handleScanReceipt,
    isAutoProcessing,
    autoProcessReceipt
  };
}
