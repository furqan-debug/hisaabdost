
import { useState, useEffect, useRef } from 'react';
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
  const processingRef = useRef(false);

  // Retry logic for failed scans with exponential backoff
  // Limit to 1 retry (2 total attempts) and add more delay between retries
  useEffect(() => {
    // Only retry if:
    // 1. We have an error or timeout
    // 2. We're on the first attempt
    // 3. No processing is currently in progress
    if ((scanTimedOut || scanError) && 
        attemptCount === 1 && 
        !processingComplete && 
        !processingRef.current) {
      
      console.log(`Retry trigger fired. Attempt count: ${attemptCount}`);
      processingRef.current = true; // Mark as processing
      
      // Use a longer backoff delay (3 seconds)
      const backoffDelay = 3000;
      
      // Auto-retry with backoff
      const retryTimer = setTimeout(() => {
        console.log(`Auto-retrying receipt scan (attempt ${attemptCount + 1} of 2)`);
        resetScanState();
        autoProcessReceipt();
        setAttemptCount(prev => prev + 1);
      }, backoffDelay);
      
      return () => clearTimeout(retryTimer);
    }
    
    // If we've reached max retries and still have errors, show a message
    if ((scanTimedOut || scanError) && attemptCount >= 2 && !processingComplete) {
      toast.error("Receipt processing failed. Using basic information only.");
      processingRef.current = false; // Mark as not processing
      
      // Try to get at least basic info from the image
      if (onCapture) {
        onCapture({
          description: "Store Purchase",
          amount: "0.00",
          date: new Date().toISOString().split('T')[0],
          category: "Other",
          paymentMethod: "Card"
        });
      }
      
      // Close dialog after showing error, but with a delay
      const closeTimer = setTimeout(() => {
        setOpen(false);
      }, 2000);
      
      return () => clearTimeout(closeTimer);
    }
  }, [scanTimedOut, scanError, attemptCount, processingComplete, resetScanState, autoProcessReceipt, onCapture, setOpen]);

  const startProcessing = () => {
    processingRef.current = true;
    setAttemptCount(1);
    autoProcessReceipt();
  };

  const isProcessing = () => processingRef.current;
  const setProcessing = (value: boolean) => {
    processingRef.current = value;
  };

  return {
    attemptCount,
    startProcessing,
    isProcessing,
    setProcessing,
    setAttemptCount
  };
}
