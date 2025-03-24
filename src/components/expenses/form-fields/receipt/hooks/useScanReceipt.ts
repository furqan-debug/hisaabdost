
import { useCallback, useEffect } from "react";
import { useScanState } from "./useScanState";
import { useScanProcess } from "./useScanProcess";
import { useScanResults } from "./useScanResults";

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
    setIsScanning,
    scanProgress, 
    setScanProgress,
    scanTimedOut,
    setScanTimedOut,
    startScan,
    endScan,
    updateProgress,
    timeoutScan 
  } = useScanState();

  // Use the process scan hook for actually processing the scan
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

  // Handle scan button click
  const handleScanReceipt = useCallback(async () => {
    if (!file) return;

    try {
      startScan();
      
      // Create FormData with receipt file
      const formData = new FormData();
      formData.append('receipt', file);
      
      // Process the scan
      await processScan(formData);
      
    } catch (error) {
      console.error("Error in handleScanReceipt:", error);
      endScan();
    }
  }, [file, startScan, processScan, endScan]);

  return {
    isScanning,
    scanProgress,
    scanTimedOut,
    handleScanReceipt
  };
}
