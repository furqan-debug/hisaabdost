
import { useCallback } from 'react';
import { toast } from 'sonner';
import { scanReceipt } from '../services/receiptScannerService';
import { selectMainItem } from '../utils/itemSelectionUtils';

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
  errorScan: (message: string) => void;
  endScan: () => void;
  onCleanup: () => void;
  setOpen: (open: boolean) => void;
  autoSave?: boolean;
  onSuccess?: () => void;
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
  onCleanup,
  setOpen,
  autoSave,
  onSuccess
}: UseAutoProcessProps) {
  
  const autoProcessReceipt = useCallback(async () => {
    if (!file || isScanning || isAutoProcessing) return;
    
    startScan();
    updateProgress(5, "Preparing receipt...");
    
    try {
      const receiptUrl = file ? URL.createObjectURL(file) : undefined;
      
      const scanResults = await scanReceipt({
        file,
        receiptUrl,
        onProgress: (progress, message) => updateProgress(progress, message),
        onTimeout: () => timeoutScan(),
        onError: (error) => errorScan(error)
      });
      
      if (scanResults?.isTimeout) {
        toast.error("Receipt scan timed out. Please try again or enter details manually.");
      } else if (scanResults?.error) {
        toast.error(scanResults.error);
      }
      
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
        
        // Update form with the extracted information
        if (onCapture) {
          onCapture(expenseDetails);
        }
      }
      
      // Cleanup tasks
      endScan();
      onCleanup();
      setOpen(false);
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Error during auto-processing:", error);
      errorScan("Failed to auto-process receipt. Please try again.");
      toast.error("Failed to auto-process receipt. Please try again.");
    } finally {
      endScan();
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
    onSuccess
  ]);

  return { autoProcessReceipt };
}
