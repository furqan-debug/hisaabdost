
import { useState, useCallback } from "react";
import { formatReceiptItem } from "../utils/formatUtils";
import { scanReceipt } from "../services/receiptScannerService";
import { saveExpenseFromScan } from "../services/expenseDbService";
import { toast } from "sonner";

interface UseAutoProcessProps {
  file: File | null;
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
  onSuccess?: () => void;
  onCleanup: () => void;
  setOpen: (open: boolean) => void;
  autoSave: boolean;
}

export function useAutoProcess({
  file,
  isScanning,
  isAutoProcessing,
  onCapture,
  startScan,
  updateProgress,
  timeoutScan,
  errorScan,
  endScan,
  onSuccess,
  onCleanup,
  setOpen,
  autoSave
}: UseAutoProcessProps) {
  // Auto-process a receipt scan
  const autoProcessReceipt = useCallback(async () => {
    if (!file || isScanning || isAutoProcessing) return;
    
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
        // Process the received data to ensure it's valid
        const validatedItems = result.items.map(item => formatReceiptItem(item, result.date));
        
        // Save to session storage for the form to use
        if (onCapture && validatedItems[0]) {
          onCapture(validatedItems[0]);
        }
        
        // Save to database if autoSave is enabled
        if (autoSave) {
          const saveResult = await saveExpenseFromScan({
            items: validatedItems,
            merchant: result.merchant || "Store",
            date: validatedItems[0].date
          });
          
          if (saveResult) {
            // Success - close dialog after a short delay
            updateProgress(100, "Receipt processed and expenses saved!");
            
            setTimeout(() => {
              if (onSuccess) onSuccess();
              onCleanup();
              setOpen(false);
              
              toast.success("Receipt processed and expenses saved successfully");
            }, 1000);
            return;
          } else {
            // Save failed but we have valid items
            errorScan("Failed to save expenses to database");
          }
        } else {
          // Just update the form with data, don't save to database
          updateProgress(100, "Receipt data extracted!");
          
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onCleanup();
            setOpen(false);
          }, 1000);
          return;
        }
      } else {
        // If we got here, something failed
        if (result.isTimeout) {
          timeoutScan();
        } else if (result.error) {
          errorScan(result.error);
        } else {
          errorScan("Failed to process receipt");
        }
      }
    } catch (error) {
      console.error("Error in auto-processing:", error);
      errorScan(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }, [file, isScanning, isAutoProcessing, updateProgress, timeoutScan, errorScan, onCapture, onCleanup, setOpen, autoSave, onSuccess]);

  return { autoProcessReceipt };
}
