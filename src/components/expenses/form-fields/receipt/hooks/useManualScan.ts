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
    if (!file || isScanning || isAutoProcessing) return;
    
    startScan();
    
    try {
      const localReceiptUrl = URL.createObjectURL(file);
      setReceiptUrl(localReceiptUrl);
      
      const scanResults = await scanReceipt({
        file: file,
        receiptUrl: localReceiptUrl,
        onProgress: updateProgress,
        onTimeout: timeoutScan,
        onError: errorScan
      });
      
      if (scanResults && scanResults.success && scanResults.items && scanResults.items.length > 0) {
        const mainItem = selectMainItem(scanResults.items);
              
        let expenseDetails = {
          description: mainItem.description || "Store Purchase",
          amount: mainItem.amount || "0.00",
          date: mainItem.date || scanResults.date || new Date().toISOString().split('T')[0],
          category: mainItem.category || "Other",
          paymentMethod: "Card",
        };
              
        console.log("Extracted expense details:", expenseDetails);
        
        if (onCapture) {
          onCapture(expenseDetails);
        }
        
        if (autoSave) {
          setOpen(false);
          onSuccess?.();
        }
        
        endScan();
        onCleanup();
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
          
          endScan();
          onCleanup();
        } else {
          if (scanResults && scanResults.isTimeout) {
            timeoutScan();
          } else if (scanResults && scanResults.error) {
            errorScan(scanResults.error);
          } else {
            errorScan("Failed to scan receipt. Please try again.");
          }
          
          endScan();
        }
      }
    } catch (error) {
      console.error("Error during manual scan:", error);
      errorScan("An unexpected error occurred during the scan.");
      endScan();
    } finally {
      if (receiptUrl) {
        URL.revokeObjectURL(receiptUrl);
        setReceiptUrl(null);
      }
    }
  }, [
    file,
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
