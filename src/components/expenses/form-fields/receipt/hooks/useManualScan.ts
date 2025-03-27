
import { useState, useCallback } from "react";
import { scanReceipt } from "../services/receiptScannerService";
import { ExpenseFormData } from "@/hooks/expense-form/types";
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
  
  // Handle the scan receipt process
  const handleScanReceipt = useCallback(async () => {
    if (!file || isScanning || isAutoProcessing) return;
    
    startScan();
    
    try {
      // Generate a local URL for the image
      const localReceiptUrl = URL.createObjectURL(file);
      setReceiptUrl(localReceiptUrl);
      
      // Scan the receipt using the receipt scanner service
      const scanResults = await scanReceipt({
        file: file,
        receiptUrl: localReceiptUrl,
        onProgress: updateProgress,
        onTimeout: timeoutScan,
        onError: errorScan
      });
      
      // First instance where 'merchant' needs to be removed
      if (scanResults && scanResults.success && scanResults.items && scanResults.items.length > 0) {
        const mainItem = selectMainItem(scanResults.items);
              
        // Get general expense information
        let expenseDetails = {
          description: mainItem.description || "Store Purchase",
          amount: mainItem.amount || "0.00",
          date: mainItem.date || scanResults.date || new Date().toISOString().split('T')[0],
          category: mainItem.category || "Other",
          paymentMethod: "Card",
        };
              
        console.log("Extracted expense details:", expenseDetails);
        
        // Capture the extracted expense details
        if (onCapture) {
          onCapture(expenseDetails);
        }
        
        // Auto-save and close the modal
        if (autoSave) {
          setOpen(false);
          onSuccess?.();
        }
        
        // Clean up after a successful scan
        endScan();
        onCleanup();
        
      } else {
        // Update the part with the single generic item reference
        if (scanResults && scanResults.success && (!scanResults.items || scanResults.items.length === 0)) {
          // Generate a generic expense if no items were found
          const genericExpense = {
            description: "Store Purchase",
            amount: "0.00",
            date: scanResults.date || new Date().toISOString().split('T')[0],
            category: "Other",
            paymentMethod: "Card",
          };
          
          console.log("Using generic expense:", genericExpense);
          
          // Capture the generic expense details
          if (onCapture) {
            onCapture(genericExpense);
          }
          
          // Auto-save and close the modal
          if (autoSave) {
            setOpen(false);
            onSuccess?.();
          }
          
          // Clean up after a successful scan
          endScan();
          onCleanup();
        } else {
          // Handle errors and timeouts
          if (scanResults && scanResults.isTimeout) {
            timeoutScan();
          } else if (scanResults && scanResults.error) {
            errorScan(scanResults.error);
          } else {
            errorScan("Failed to scan receipt. Please try again.");
          }
          
          // Clean up after an unsuccessful scan
          endScan();
        }
      }
    } catch (error) {
      console.error("Error during manual scan:", error);
      errorScan("An unexpected error occurred during the scan.");
      endScan();
    } finally {
      // Revoke the local URL
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
