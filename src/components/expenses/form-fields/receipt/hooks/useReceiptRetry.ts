
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseReceiptRetryProps {
  scanTimedOut: boolean;
  scanError: string | null;
  isScanning: boolean;
  isAutoProcessing: boolean;
  processingComplete: boolean;
  resetScanState: () => void;
  autoProcessReceipt: () => void;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
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
  const [isProcessing, setProcessing] = useState(false);
  
  const startProcessing = useCallback(() => {
    if (isScanning || isAutoProcessing) {
      console.log("Cannot retry while processing is in progress");
      return;
    }
    
    setProcessing(true);
    setAttemptCount(prev => prev + 1);
    resetScanState();
    
    console.log(`Starting receipt processing (attempt ${attemptCount + 1})`);
    autoProcessReceipt();
  }, [isScanning, isAutoProcessing, attemptCount, resetScanState, autoProcessReceipt]);
  
  const handleRetry = useCallback(() => {
    if (scanTimedOut || scanError) {
      if (attemptCount < 3) {
        toast.info("Retrying receipt scan...");
        startProcessing();
      } else {
        toast.error("Maximum retry attempts reached. Please try uploading the receipt again.");
        setOpen(false);
      }
    }
  }, [scanTimedOut, scanError, attemptCount, startProcessing, setOpen]);
  
  const isMaxAttemptsReached = attemptCount >= 3;
  
  // Create an explicit method to check if processing is in progress
  const isProcessingInProgress = useCallback(() => {
    return isProcessing;
  }, [isProcessing]);
  
  const resetAndClose = () => {
    resetScanState();
    setProcessing(false);
    setAttemptCount(0);
    setOpen(false);
    
    // Dispatch an event to notify that a receipt was scanned
    if (processingComplete) {
      const event = new CustomEvent('receipt-scanned', { 
        detail: { timestamp: Date.now() } 
      });
      window.dispatchEvent(event);
      
      // Also dispatch the general expenses-updated event
      const updateEvent = new CustomEvent('expenses-updated', { 
        detail: { timestamp: Date.now() } 
      });
      window.dispatchEvent(updateEvent);
    }
  };
  
  return {
    attemptCount,
    setAttemptCount,
    isProcessing,
    setProcessing,
    handleRetry,
    startProcessing,
    isMaxAttemptsReached,
    resetAndClose,
    isProcessingInProgress  // Add this method to check if processing is happening
  };
}
