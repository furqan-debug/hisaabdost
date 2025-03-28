
import { useState, useCallback } from "react";
import { useScanState } from "./useScanState";
import { useAutoProcess } from "./useAutoProcess";
import { useManualScan } from "./useManualScan";

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
  onSuccess?: () => void;
}

export function useScanReceipt({ 
  file, 
  onCleanup, 
  onCapture, 
  autoSave = true,
  setOpen,
  onSuccess
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
  const [lastScannedFile, setLastScannedFile] = useState<File | null>(null);
  
  // Import auto processing functionality
  const { autoProcessReceipt } = useAutoProcess({
    file,
    isScanning,
    isAutoProcessing,
    onCapture,
    startScan,
    updateProgress,
    timeoutScan,
    errorScan,
    endScan,
    onSuccess,
    onCleanup,
    setOpen,
    autoSave
  });
  
  // Import manual scanning functionality
  const { handleScanReceipt } = useManualScan({
    file,
    lastScannedFile,
    isScanning,
    isAutoProcessing,
    onCapture,
    startScan,
    updateProgress,
    timeoutScan,
    errorScan,
    endScan,
    onCleanup,
    setOpen,
    autoSave,
    onSuccess
  });
  
  // Wrapper for auto-processing to update component state
  const handleAutoProcessReceipt = useCallback(async () => {
    if (!file || isScanning || isAutoProcessing) {
      console.log("Cannot process: file missing or already processing", {
        hasFile: !!file,
        isScanning,
        isAutoProcessing
      });
      return;
    }
    
    console.log(`Starting auto-processing for ${file.name} (${file.size} bytes)`);
    setIsAutoProcessing(true);
    setLastScannedFile(file);
    
    try {
      await autoProcessReceipt();
    } catch (error) {
      console.error("Auto-processing error:", error);
      errorScan(error instanceof Error ? error.message : "Unknown error during processing");
    } finally {
      setIsAutoProcessing(false);
    }
  }, [file, isScanning, isAutoProcessing, autoProcessReceipt, errorScan]);
  
  // Wrapper for manual scanning to update component state
  const handleManualScanReceipt = useCallback(async () => {
    if (!file && !lastScannedFile) {
      console.error("Cannot scan: No file available");
      errorScan("No file available for scanning");
      return;
    }
    
    if (file) {
      console.log(`Setting last scanned file: ${file.name}`);
      setLastScannedFile(file);
    }
    
    try {
      await handleScanReceipt();
    } catch (error) {
      console.error("Manual scan error:", error);
      errorScan(error instanceof Error ? error.message : "Unknown error during scanning");
    }
  }, [file, lastScannedFile, handleScanReceipt, errorScan]);
  
  // Reset all state
  const resetScanState = useCallback(() => {
    console.log("Resetting scan state");
    resetState();
    setIsAutoProcessing(false);
    // Don't reset lastScannedFile so it can be used for retries
  }, [resetState]);
  
  return {
    isScanning,
    scanProgress,
    scanTimedOut,
    scanError,
    statusMessage,
    handleScanReceipt: handleManualScanReceipt,
    isAutoProcessing,
    autoProcessReceipt: handleAutoProcessReceipt,
    resetScanState
  };
}
