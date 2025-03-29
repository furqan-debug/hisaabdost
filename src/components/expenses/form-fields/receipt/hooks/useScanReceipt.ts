
import { useState, useCallback } from 'react';
import { useScanProcess } from './useScanProcess';
import { useScanState } from './useScanState';
import { processLocalReceipt } from '../utils/receiptLocalProcessor';
import { toast } from 'sonner';

export interface UseScanReceiptProps {
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
  autoSave = false,
  setOpen,
  onSuccess
}: UseScanReceiptProps) {
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);
  
  // Use the scan state hook for managing scan progress, status, etc.
  const {
    isScanning,
    scanProgress,
    scanTimedOut,
    scanError,
    statusMessage,
    startScan,
    updateProgress,
    endScan: originalEndScan,
    timeoutScan,
    errorScan,
    resetScanState,
    setScanError
  } = useScanState();
  
  // Enhanced endScan that calls onSuccess
  const endScan = useCallback(() => {
    originalEndScan();
    if (onSuccess) {
      onSuccess();
    }
  }, [originalEndScan, onSuccess]);
  
  // Use the scan process hook for handling the OCR processing
  const { processScan } = useScanProcess({
    updateProgress,
    endScan,
    timeoutScan,
    errorScan
  });
  
  // Handle manual scan request
  const handleScanReceipt = useCallback(async () => {
    if (!file) {
      toast.error("No file selected for scanning");
      return;
    }
    
    console.log(`Starting manual scan of receipt: ${file.name}`);
    
    try {
      startScan();
      updateProgress(5, "Preparing receipt...");
      
      // Create FormData with the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Try to process with server
      try {
        const scanResults = await processScan(formData);
        
        if (scanResults) {
          console.log("Server scan successful:", scanResults);
          
          if (onCapture && scanResults.success && scanResults.items && scanResults.items.length > 0) {
            // Use the first item or total amount
            const firstItem = scanResults.items[0];
            const expenseDetails = {
              description: firstItem.name || 'Receipt Scan',
              amount: firstItem.amount || scanResults.total || "0.00",
              date: firstItem.date || scanResults.date || new Date().toISOString().split('T')[0],
              category: firstItem.category || 'Other',
              paymentMethod: firstItem.paymentMethod || 'Card'
            };
            
            console.log("Captured expense details:", expenseDetails);
            onCapture(expenseDetails);
            
            if (autoSave) {
              // Close dialog after success if autoSave is enabled
              setTimeout(() => {
                setOpen(false);
              }, 1000);
            }
          }
        } else {
          throw new Error("Scan failed to return valid results");
        }
      } catch (error) {
        console.error("Server scan failed, trying local fallback:", error);
        setScanError("Server processing failed. Using local recognition instead.");
        
        // Try local processing
        updateProgress(60, "Using local recognition...");
        
        try {
          const localResults = await processLocalReceipt(file);
          console.log("Local processing results:", localResults);
          
          if (localResults && onCapture) {
            // Use first item or total
            const firstItem = localResults.items[0];
            onCapture({
              description: firstItem.name || 'Store Purchase',
              amount: firstItem.amount || localResults.total || "0.00",
              date: firstItem.date || localResults.date || new Date().toISOString().split('T')[0],
              category: firstItem.category || 'Other',
              paymentMethod: firstItem.paymentMethod || 'Card'
            });
            
            updateProgress(100, "Processed with local recognition");
            
            // Close dialog after success if autoSave is enabled
            if (autoSave) {
              setTimeout(() => {
                setOpen(false);
              }, 1000);
            }
          }
          
          // Still count this as a success but with local processing
          endScan();
        } catch (localError) {
          console.error("Local processing also failed:", localError);
          errorScan("Both server and local processing failed. Please try again or enter details manually.");
        }
      }
    } catch (error) {
      console.error("Receipt scanning error:", error);
      errorScan("An unexpected error occurred while scanning");
    }
  }, [file, startScan, updateProgress, processScan, setScanError, endScan, onCapture, setOpen, autoSave, errorScan]);
  
  // Auto-process receipt without requiring user to click scan button
  const autoProcessReceipt = useCallback(() => {
    if (!file) {
      console.error("Cannot auto-process: No file provided");
      return;
    }
    
    setIsAutoProcessing(true);
    
    // Slight delay to allow UI to update
    setTimeout(async () => {
      try {
        await handleScanReceipt();
      } finally {
        setIsAutoProcessing(false);
      }
    }, 100);
  }, [file, handleScanReceipt]);

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
