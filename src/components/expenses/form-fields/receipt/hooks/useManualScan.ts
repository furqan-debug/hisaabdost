
import { useCallback } from "react";
import { formatReceiptItem } from "../utils/formatUtils";
import { scanReceipt } from "../services/receiptScannerService";
import { saveExpenseFromScan } from "../services/expenseDbService";
import { toast } from "sonner";

interface UseManualScanProps {
  file: File | null;
  lastScannedFile: File | null;
  isScanning: boolean;
  isAutoProcessing: boolean;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  startScan: () => void;
  updateProgress: (progress: number, message?: string) => void;
  timeoutScan: () => void;
  errorScan: (error: string) => void;
  endScan: () => void;
  onCleanup: () => void;
  setOpen: (open: boolean) => void;
  autoSave: boolean;
  onSuccess?: () => void;
}

export function useManualScan({
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
}: UseManualScanProps) {
  // Scan the receipt manually
  const handleScanReceipt = useCallback(async () => {
    // Use the current file or the last successfully scanned file for retry
    const fileToScan = file || lastScannedFile;
    
    if (!fileToScan || isScanning || isAutoProcessing) return;
    
    startScan();
    
    try {
      const result = await scanReceipt({
        file: fileToScan,
        onProgress: updateProgress,
        onTimeout: timeoutScan,
        onError: errorScan
      });
      
      if (result.success && result.items && result.items.length > 0) {
        // Process the received data to ensure it's valid
        const validatedItems = result.items.map(item => formatReceiptItem(item, result.date));
        
        // Save to session storage for the form to use
        if (onCapture && validatedItems[0]) {
          onCapture(validatedItems[0]);
        }
        
        // Save to database if autoSave is enabled
        if (autoSave) {
          await saveExpenseFromScan({
            items: validatedItems,
            merchant: result.merchant || "Store",
            date: validatedItems[0].date
          });
        }
        
        // Success - close dialog after a short delay
        setTimeout(() => {
          endScan();
          if (onSuccess) onSuccess();
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
          // Process the received data to ensure it's valid
          const validatedItems = result.items.map(item => formatReceiptItem(item, result.date));
          
          if (onCapture && validatedItems[0]) {
            onCapture(validatedItems[0]);
            
            // Save to database if autoSave is enabled
            if (autoSave) {
              await saveExpenseFromScan({
                items: validatedItems,
                merchant: result.merchant || "Store",
                date: validatedItems[0].date
              });
            }
            
            toast.warning("Receipt processed with limited accuracy");
            
            setTimeout(() => {
              endScan();
              if (onSuccess) onSuccess();
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
  }, [file, lastScannedFile, isScanning, isAutoProcessing, startScan, updateProgress, timeoutScan, errorScan, endScan, onCapture, onCleanup, setOpen, autoSave, onSuccess]);

  return { handleScanReceipt };
}
