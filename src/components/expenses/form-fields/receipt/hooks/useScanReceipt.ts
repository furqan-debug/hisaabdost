
import { useState, useCallback } from "react";
import { useScanState } from "./useScanState";
import { scanReceipt } from "../services/receiptScannerService";
import { saveExpenseFromScan } from "../services/expenseDbService";
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
  autoSave = false,
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
  const [lastScannedFile, setLastScannedFile] = useState<File | null>(null);
  
  // Scan the receipt manually
  const handleScanReceipt = useCallback(async () => {
    // Use the current file or the last successfully scanned file for retry
    const fileToScan = file || lastScannedFile;
    
    if (!fileToScan || isScanning || isAutoProcessing) return;
    
    startScan();
    setLastScannedFile(fileToScan);
    
    try {
      const result = await scanReceipt({
        file: fileToScan,
        onProgress: updateProgress,
        onTimeout: timeoutScan,
        onError: errorScan
      });
      
      if (result.success && result.items && result.items.length > 0) {
        // Save to session storage for the form to use
        if (onCapture && result.items[0]) {
          onCapture(result.items[0]);
        }
        
        // Save to database if autoSave is enabled
        if (autoSave) {
          await saveExpenseFromScan({
            items: result.items,
            merchant: result.merchant,
            date: result.date
          });
        }
        
        // Success - close dialog
        setTimeout(() => {
          endScan();
          onCleanup();
          setOpen(false);
          
          // Only show the success message if we're not auto-processing
          if (!isAutoProcessing) {
            toast.success("Receipt processed successfully");
          }
        }, 1000);
      } else {
        // Handle partial success - we might have errors but still got some data
        if (result.items && result.items.length > 0) {
          if (onCapture && result.items[0]) {
            onCapture(result.items[0]);
            
            if (autoSave) {
              await saveExpenseFromScan({
                items: result.items,
                merchant: result.merchant,
                date: result.date
              });
            }
            
            toast.warning("Receipt processed with limited accuracy");
            
            setTimeout(() => {
              endScan();
              onCleanup();
              setOpen(false);
            }, 1000);
            
            return;
          }
        }
        
        // No useful data was extracted
        if (result.isTimeout) {
          timeoutScan();
        } else {
          errorScan(result.error || "Failed to process receipt");
        }
      }
    } catch (error) {
      console.error("Error scanning receipt:", error);
      errorScan(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }, [file, lastScannedFile, isScanning, isAutoProcessing, startScan, updateProgress, timeoutScan, errorScan, endScan, onCapture, autoSave, onCleanup, setOpen]);
  
  // Auto-process a receipt scan
  const autoProcessReceipt = useCallback(async () => {
    if (!file || isScanning || isAutoProcessing) return;
    
    setIsAutoProcessing(true);
    setLastScannedFile(file);
    updateProgress(5, "Starting automatic receipt processing...");
    
    try {
      const result = await scanReceipt({
        file,
        onProgress: (progress, message) => {
          updateProgress(progress, message);
        },
        onTimeout: timeoutScan,
        onError: errorScan
      });
      
      if (result.success && result.items && result.items.length > 0) {
        // Save to session storage for the form to use
        if (onCapture && result.items[0]) {
          onCapture(result.items[0]);
        }
        
        // Save to database if autoSave is enabled
        if (autoSave) {
          const saveResult = await saveExpenseFromScan({
            items: result.items,
            merchant: result.merchant,
            date: result.date
          });
          
          if (saveResult) {
            // Success - close dialog
            updateProgress(100, "Receipt processed and expenses saved!");
            
            setTimeout(() => {
              setIsAutoProcessing(false);
              onCleanup();
              setOpen(false);
              
              toast.success("Receipt processed and expenses saved successfully");
            }, 1000);
            return;
          }
        } else {
          // Just close dialog without saving
          updateProgress(100, "Receipt processed successfully!");
          
          setTimeout(() => {
            setIsAutoProcessing(false);
            onCleanup();
            setOpen(false);
            
            toast.success("Receipt processed successfully");
          }, 1000);
          return;
        }
      }
      
      // If we got here, something failed
      if (result.isTimeout) {
        timeoutScan();
      } else if (result.error) {
        errorScan(result.error);
      } else {
        errorScan("Failed to process receipt");
      }
      
      setIsAutoProcessing(false);
    } catch (error) {
      console.error("Error in auto-processing:", error);
      errorScan(error instanceof Error ? error.message : "An unknown error occurred");
      setIsAutoProcessing(false);
    }
  }, [file, isScanning, isAutoProcessing, updateProgress, timeoutScan, errorScan, onCapture, autoSave, onCleanup, setOpen]);
  
  // Reset all state
  const resetScanState = useCallback(() => {
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
    handleScanReceipt,
    isAutoProcessing,
    autoProcessReceipt,
    resetScanState
  };
}
