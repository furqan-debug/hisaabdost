
import { useState, useCallback } from 'react';
import { scanReceipt } from '../services/receiptScannerService';
import { processScanResults } from '../utils/processScanUtils';
import { toast } from 'sonner';
import { selectMainItem } from '../utils/itemSelectionUtils';

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
  setOpen: (open: boolean) => void;
  autoSave?: boolean;
  onSuccess?: () => void;
  processAllItems?: boolean;
}

export function useScanReceipt({
  file,
  onCleanup,
  onCapture,
  setOpen,
  autoSave = true,
  onSuccess,
  processAllItems = true
}: UseScanReceiptProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [scanTimedOut, setScanTimedOut] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  
  const resetScanState = useCallback(() => {
    setIsScanning(false);
    setIsAutoProcessing(false);
    setScanProgress(0);
    setStatusMessage(undefined);
    setScanTimedOut(false);
    setScanError(null);
    setProcessingComplete(false);
  }, []);
  
  const updateProgress = useCallback((progress: number, message?: string) => {
    setScanProgress(progress);
    if (message) setStatusMessage(message);
  }, []);
  
  const startScan = useCallback(() => {
    console.log("Starting receipt scan...");
    setIsScanning(true);
    setIsAutoProcessing(true);
    setScanProgress(0);
    setScanTimedOut(false);
    setScanError(null);
    setProcessingComplete(false);
  }, []);
  
  const timeoutScan = useCallback(() => {
    console.log("Receipt scan timed out");
    setScanTimedOut(true);
    setIsScanning(false);
    setIsAutoProcessing(false);
    toast.error("Receipt scan timed out. Please try again.");
  }, []);
  
  const errorScan = useCallback((message: string) => {
    console.log("Receipt scan error:", message);
    setScanError(message);
    setIsScanning(false);
    setIsAutoProcessing(false);
    toast.error("Error scanning receipt: " + message);
  }, []);
  
  const endScan = useCallback(() => {
    console.log("Receipt scan completed");
    setIsScanning(false);
    setIsAutoProcessing(false);
  }, []);
  
  const handleScanReceipt = useCallback(async () => {
    if (!file) {
      toast.error("No receipt file selected");
      return false;
    }
    
    if (isScanning) {
      toast.info("Scan already in progress");
      return false;
    }
    
    startScan();
    const receiptUrl = file ? URL.createObjectURL(file) : undefined;
    
    try {
      console.log("Calling scanReceipt service...");
      const scanResults = await scanReceipt({
        file,
        receiptUrl,
        onProgress: updateProgress,
        onTimeout: timeoutScan,
        onError: errorScan
      });
      
      console.log("Scan results received:", scanResults);
      
      if (scanResults?.success && scanResults.items && scanResults.items.length > 0) {
        updateProgress(90, "Processing scan results...");
        
        if (autoSave && processAllItems) {
          try {
            updateProgress(95, "Saving expenses to database...");
            console.log("Processing all items for auto-save...");
            
            // Process all items from the receipt
            const success = await processScanResults(
              scanResults,
              true,
              onCapture,
              setOpen
            );
            
            if (success) {
              updateProgress(100, "All expenses saved successfully!");
              setProcessingComplete(true);
              console.log("Receipt processing completed successfully");
              
              if (onSuccess) {
                onSuccess();
              }
              
              return true;
            } else {
              updateProgress(100, "Failed to save all expenses");
              errorScan("Failed to save expenses to database");
              return false;
            }
          } catch (error) {
            console.error("Error saving expenses:", error);
            updateProgress(100, "Error saving to database");
            errorScan("Failed to save to database");
            return false;
          }
        } else {
          // Manual mode - just extract main item for form
          const mainItem = selectMainItem(scanResults.items);
          const currentDate = new Date().toISOString().split('T')[0];
          
          let expenseDetails = {
            description: mainItem.description || scanResults.merchant || "Store Purchase",
            amount: mainItem.amount || scanResults.total || "0.00",
            date: mainItem.date || scanResults.date || currentDate,
            category: mainItem.category || "Other",
            paymentMethod: mainItem.paymentMethod || "Card",
          };
          
          if (onCapture) {
            onCapture(expenseDetails);
          }
          
          updateProgress(100, "Receipt processed successfully!");
          setProcessingComplete(true);
          return true;
        }
      } else if (scanResults?.isTimeout) {
        timeoutScan();
        return false;
      } else if (scanResults?.error) {
        errorScan(scanResults.error);
        return false;
      } else {
        errorScan("Failed to extract data from receipt");
        return false;
      }
    } catch (error) {
      console.error("Error in receipt scanning:", error);
      errorScan("An unexpected error occurred");
      return false;
    } finally {
      endScan();
    }
    
    return false;
  }, [
    file,
    isScanning,
    startScan,
    updateProgress,
    timeoutScan,
    errorScan,
    autoSave,
    onCapture,
    onSuccess,
    endScan,
    processAllItems,
    setOpen
  ]);
  
  const autoProcessReceipt = useCallback(() => {
    console.log("Auto-processing receipt...");
    return handleScanReceipt();
  }, [handleScanReceipt]);
  
  return {
    isScanning,
    scanProgress,
    scanTimedOut,
    scanError,
    statusMessage,
    handleScanReceipt,
    isAutoProcessing,
    processingComplete,
    autoProcessReceipt,
    resetScanState
  };
}
