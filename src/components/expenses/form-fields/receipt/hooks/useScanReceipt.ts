
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
  autoSave = true,
  setOpen
}: UseScanReceiptProps) {
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
    errorScan,
    resetState
  } = useScanState();
  
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);
  const [lastFormData, setLastFormData] = useState<FormData | null>(null);

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

  // Validate and process receipt file
  const validateAndProcessReceipt = useCallback(async (isAuto: boolean) => {
    if (!file) {
      toast.error("No receipt file selected");
      return;
    }
    
    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Please use an image under 10MB");
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please use JPEG, PNG, HEIC or PDF");
      return;
    }

    try {
      if (isAuto) {
        setIsAutoProcessing(true);
        updateProgress(10, "Auto-processing receipt...");
      } else {
        startScan();
      }
      
      // Create FormData
      const formData = new FormData();
      formData.append('receipt', file);
      setLastFormData(formData);
      
      // Process the scan
      await processScan(formData);
      
      if (isAuto) {
        setIsAutoProcessing(false);
      }
    } catch (error) {
      console.error("Error processing receipt:", error);
      errorScan("An unexpected error occurred during scanning");
      if (isAuto) {
        setIsAutoProcessing(false);
      }
    }
  }, [file, startScan, processScan, errorScan, updateProgress]);

  // Handle retry with existing form data
  const handleRetry = useCallback(() => {
    if (lastFormData && (scanTimedOut || scanError)) {
      console.log("Retrying scan with existing receipt...");
      resetState();
      startScan();
      processScan(lastFormData).catch((error) => {
        console.error("Error in retry:", error);
        errorScan("Retry failed. The receipt may be too complex to process.");
      });
    } else {
      toast.error("No previous scan data available for retry");
    }
  }, [lastFormData, scanTimedOut, scanError, resetState, startScan, processScan, errorScan]);

  // Handle manual scan button click
  const handleScanReceipt = useCallback(() => {
    if (scanTimedOut || scanError) {
      handleRetry();
    } else {
      validateAndProcessReceipt(false);
    }
  }, [validateAndProcessReceipt, scanTimedOut, scanError, handleRetry]);
  
  // Handle automatic processing
  const autoProcessReceipt = useCallback(() => {
    validateAndProcessReceipt(true);
  }, [validateAndProcessReceipt]);

  // Reset scan state
  const resetScanState = useCallback(() => {
    resetState();
    setIsAutoProcessing(false);
    setLastFormData(null);
  }, [resetState]);

  return {
    isScanning,
    scanProgress,
    scanTimedOut,
    scanError,
    statusMessage,
    handleScanReceipt,
    isAutoProcessing,
    autoProcessReceipt,
    resetScanState
  };
}
