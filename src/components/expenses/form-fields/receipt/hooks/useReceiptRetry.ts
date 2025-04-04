
import { useState, useCallback } from 'react';

interface UseReceiptRetryProps {
  scanTimedOut: boolean;
  scanError: string | null;
  isScanning: boolean;
  isAutoProcessing: boolean;
  processingComplete: boolean;
  resetScanState: () => void;
  autoProcessReceipt: () => void;
  onCapture?: (expenseDetails: any) => void;
  setOpen: (open: boolean) => void;
}

export function useReceiptRetry({
  scanTimedOut,
  scanError,
  isScanning,
  isAutoProcessing,
  processingComplete,
  resetScanState,
  autoProcessReceipt,
  onCapture,
  setOpen
}: UseReceiptRetryProps) {
  const [attemptCount, setAttemptCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  
  const isProcessingInProgress = useCallback(() => {
    return isScanning || isAutoProcessing || processing;
  }, [isScanning, isAutoProcessing, processing]);
  
  const startProcessing = useCallback(() => {
    // If we're already processing or completed, don't start again
    if (isProcessingInProgress() || processingComplete) {
      console.log("Not starting processing, already in progress or completed");
      return;
    }
    
    console.log("Starting processing attempt:", attemptCount + 1);
    setProcessing(true);
    
    // Reset any previous scan state
    resetScanState();
    
    // Increment the attempt counter
    setAttemptCount((prev) => prev + 1);
    
    // Start the automatic processing
    console.log("Calling autoProcessReceipt");
    autoProcessReceipt();
  }, [
    attemptCount,
    isProcessingInProgress,
    processingComplete,
    resetScanState,
    autoProcessReceipt
  ]);
  
  const handleRetry = useCallback(() => {
    // Only retry if we're not already processing and we have an error or timeout
    if (!isProcessingInProgress() && (scanTimedOut || scanError)) {
      console.log("Retrying scan after error or timeout");
      startProcessing();
    }
  }, [scanTimedOut, scanError, isProcessingInProgress, startProcessing]);
  
  // Handle error resolution
  const handleErrorResolution = useCallback(() => {
    // If we have a scan error or timeout but want to continue manually
    if (scanTimedOut || scanError) {
      console.log("Resolving error, closing dialog");
      setOpen(false);
    }
  }, [scanTimedOut, scanError, setOpen]);
  
  return {
    attemptCount,
    processing,
    isProcessingInProgress,
    startProcessing,
    handleRetry,
    handleErrorResolution,
    setAttemptCount,
    setProcessing
  };
}
