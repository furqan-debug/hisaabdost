
import { useState, useCallback, useRef } from "react";
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
  const lastScannedFileRef = useRef<File | null>(null);
  const processingRef = useRef(false);
  
  // Import auto processing functionality
  const { autoProcessReceipt: autoProcessFn } = useAutoProcess({
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
  const { handleScanReceipt: manualScanFn } = useManualScan({
    file,
    lastScannedFile: lastScannedFileRef.current,
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
  const autoProcessReceipt = useCallback(async () => {
    if (!file || isScanning || isAutoProcessing || processingRef.current) {
      console.log("Cannot process: file missing or already processing", {
        hasFile: !!file,
        isScanning,
        isAutoProcessing,
        isProcessingRef: processingRef.current
      });
      return;
    }
    
    console.log(`Starting auto-processing for ${file.name} (${file.size} bytes)`);
    setIsAutoProcessing(true);
    processingRef.current = true;
    lastScannedFileRef.current = file;
    
    try {
      await autoProcessFn();
    } catch (error) {
      console.error("Auto-processing error:", error);
      errorScan(error instanceof Error ? error.message : "Unknown error during processing");
    } finally {
      setIsAutoProcessing(false);
      processingRef.current = false;
    }
  }, [file, isScanning, isAutoProcessing, autoProcessFn, errorScan]);
  
  // Wrapper for manual scanning to update component state
  const handleScanReceipt = useCallback(async () => {
    if (processingRef.current) {
      console.log("Processing already in progress, skipping scan request");
      return;
    }
    
    if (!file && !lastScannedFileRef.current) {
      console.error("Cannot scan: No file available");
      errorScan("No file available for scanning");
      return;
    }
    
    processingRef.current = true;
    
    if (file) {
      console.log(`Setting last scanned file: ${file.name}`);
      lastScannedFileRef.current = file;
    }
    
    try {
      await manualScanFn();
    } catch (error) {
      console.error("Manual scan error:", error);
      errorScan(error instanceof Error ? error.message : "Unknown error during scanning");
    } finally {
      processingRef.current = false;
    }
  }, [file, manualScanFn, errorScan]);
  
  // Reset all state
  const resetScanState = useCallback(() => {
    console.log("Resetting scan state");
    resetState();
    setIsAutoProcessing(false);
    processingRef.current = false;
    // Don't reset lastScannedFileRef so it can be used for retries
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
