
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
    console.log("Resetting scan state");
    setIsScanning(false);
    setIsAutoProcessing(false);
    setScanProgress(0);
    setStatusMessage(undefined);
    setScanTimedOut(false);
    setScanError(null);
    setProcessingComplete(false);
  }, []);
  
  const updateProgress = useCallback((progress: number, message?: string) => {
    console.log(`Scan progress: ${progress}% - ${message || ''}`);
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
      console.error("No file provided for scanning");
      toast.error("No receipt file selected");
      return false;
    }
    
    if (isScanning) {
      console.log("Scan already in progress, skipping");
      toast.info("Scan already in progress");
      return false;
    }
    
    console.log(`Starting receipt scan for: ${file.name} (${file.size} bytes, ${file.type})`);
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
      
      if (scanResults?.success) {
        updateProgress(90, "Processing scan results...");
        
        // Process the scan results and save to database
        try {
          console.log("Processing scan results for database save...");
          
          const success = await processScanResults(
            scanResults,
            autoSave,
            onCapture,
            setOpen
          );
          
          if (success) {
            updateProgress(100, "Expenses saved successfully!");
            setProcessingComplete(true);
            console.log("Receipt processing completed successfully");
            
            // Dispatch events to refresh expense lists
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('expenses-updated', { 
                detail: { timestamp: Date.now(), action: 'receipt-scan' }
              }));
              window.dispatchEvent(new CustomEvent('receipt-scanned', { 
                detail: { timestamp: Date.now() }
              }));
            }, 500);
            
            if (onSuccess) {
              onSuccess();
            }
            
            return true;
          } else {
            updateProgress(100, "Failed to save expenses");
            errorScan("Failed to save expenses to database");
            return false;
          }
        } catch (error) {
          console.error("Error processing scan results:", error);
          updateProgress(100, "Error saving to database");
          errorScan("Failed to save to database");
          return false;
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
