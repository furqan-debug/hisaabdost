
import { useState, useCallback } from "react";
import { scanReceipt } from "../services/receiptScannerService";
import { selectMainItem } from "../utils/itemSelectionUtils";

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
  errorScan: (message: string) => void;
  endScan: () => void;
  onCleanup: () => void;
  setOpen: (open: boolean) => void;
  autoSave?: boolean;
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
  autoSave = true,
  onSuccess
}: UseManualScanProps) {
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  
  const handleScanReceipt = useCallback(async () => {
    // Use the current file or fallback to the last scanned file
    const fileToScan = file || lastScannedFile;
    
    if (!fileToScan || isScanning || isAutoProcessing) {
      console.log("Cannot scan: no valid file or already processing", {
        hasFile: !!fileToScan,
        fileInfo: fileToScan ? `${fileToScan.name} (${fileToScan.size} bytes, ${fileToScan.type})` : 'none',
        isScanning,
        isAutoProcessing
      });
      return;
    }
    
    console.log(`Manual scanning receipt: ${fileToScan.name} (${fileToScan.size} bytes, ${fileToScan.type})`);
    startScan();
    
    try {
      // Clean up any previous URL
      if (receiptUrl) {
        URL.revokeObjectURL(receiptUrl);
      }
      
      // Create a new URL for the file
      const localReceiptUrl = URL.createObjectURL(fileToScan);
      setReceiptUrl(localReceiptUrl);
      
      updateProgress(20, "Processing receipt image...");
      
      const scanResults = await scanReceipt({
        file: fileToScan,
        receiptUrl: localReceiptUrl,
        onProgress: updateProgress,
        onTimeout: timeoutScan,
        onError: errorScan
      });
      
      if (scanResults && scanResults.success && scanResults.items && scanResults.items.length > 0) {
        updateProgress(90, "Extracting expense information...");
        
        const mainItem = selectMainItem(scanResults.items);
              
        let expenseDetails = {
          description: mainItem.description || "Store Purchase",
          amount: mainItem.amount || "0.00",
          date: mainItem.date || scanResults.date || new Date().toISOString().split('T')[0],
          category: mainItem.category || "Other",
          paymentMethod: mainItem.paymentMethod || "Card",
        };
              
        console.log("Extracted expense details:", expenseDetails);
        
        if (onCapture) {
          onCapture(expenseDetails);
        }
        
        if (autoSave) {
          updateProgress(100, "Receipt processed successfully!");
          
          setTimeout(() => {
            setOpen(false);
            onSuccess?.();
          }, 500);
        }
        
        endScan();
        
      } else {
        if (scanResults && scanResults.success && (!scanResults.items || scanResults.items.length === 0)) {
          const genericExpense = {
            description: "Store Purchase",
            amount: "0.00",
            date: scanResults.date || new Date().toISOString().split('T')[0],
            category: "Other",
            paymentMethod: "Card",
          };
          
          console.log("Using generic expense:", genericExpense);
          
          if (onCapture) {
            onCapture(genericExpense);
          }
          
          if (autoSave) {
            setOpen(false);
            onSuccess?.();
          }
        } else {
          if (scanResults && scanResults.isTimeout) {
            timeoutScan();
          } else if (scanResults && scanResults.error) {
            errorScan(scanResults.error);
          } else {
            errorScan("Failed to scan receipt. Please try again.");
          }
        }
      }
    } catch (error) {
      console.error("Error during manual scan:", error);
      errorScan("An unexpected error occurred during the scan.");
    } finally {
      if (receiptUrl) {
        URL.revokeObjectURL(receiptUrl);
        setReceiptUrl(null);
      }
      
      setTimeout(() => {
        endScan();
      }, 300);
    }
  }, [
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
    onSuccess,
    receiptUrl
  ]);

  return { handleScanReceipt };
}
