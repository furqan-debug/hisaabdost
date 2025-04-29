import { useState, useCallback } from 'react';
import { scanReceipt } from '../services/receiptScannerService';
import { saveExpenseFromScan } from '../services/expenseDbService';
import { toast } from 'sonner';
import { selectMainItem } from '../utils/itemSelectionUtils';

interface ScanResult {
  date?: string;
  total?: string;
  items?: any[];
  merchant?: string;  // Add merchant property to the interface
  receiptUrl?: string;
  success?: boolean;
  isTimeout?: boolean;
  error?: string;
}

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
  processAllItems = false
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
    setIsScanning(true);
    setIsAutoProcessing(true);
    setScanProgress(0);
    setScanTimedOut(false);
    setScanError(null);
    setProcessingComplete(false);
  }, []);
  
  const timeoutScan = useCallback(() => {
    setScanTimedOut(true);
    setIsScanning(false);
    setIsAutoProcessing(false);
    toast.error("Receipt scan timed out. Please try again.");
  }, []);
  
  const errorScan = useCallback((message: string) => {
    setScanError(message);
    setIsScanning(false);
    setIsAutoProcessing(false);
    toast.error("Error scanning receipt: " + message);
  }, []);
  
  const endScan = useCallback(() => {
    setIsScanning(false);
    setIsAutoProcessing(false);
  }, []);
  
  const handleScanReceipt = useCallback(async () => {
    if (!file) {
      toast.error("No receipt file selected");
      return;
    }
    
    if (isScanning) {
      toast.info("Scan already in progress");
      return;
    }
    
    startScan();
    const receiptUrl = file ? URL.createObjectURL(file) : undefined;
    
    try {
      const scanResults: ScanResult = await scanReceipt({
        file,
        receiptUrl,
        onProgress: updateProgress,
        onTimeout: timeoutScan,
        onError: errorScan
      });
      
      if (scanResults?.success && scanResults.items && scanResults.items.length > 0) {
        updateProgress(90, "Extracting expense information...");
        
        const mainItem = selectMainItem(scanResults.items);
        
        let expenseDetails = {
          description: mainItem.description || "Store Purchase",
          amount: mainItem.amount || "0.00",
          date: mainItem.date || scanResults.date || new Date().toISOString().split('T')[0],
          category: mainItem.category || "Other",
          paymentMethod: mainItem.paymentMethod || "Card",
        };
        
        if (autoSave) {
          try {
            updateProgress(95, "Saving expenses to database...");
            
            if (processAllItems && scanResults.items.length > 1) {
              const receiptData = {
                items: scanResults.items,
                merchant: scanResults.merchant || mainItem.description || "Store",
                date: scanResults.date || expenseDetails.date
              };
              
              const saveSuccess = await saveExpenseFromScan(receiptData);
              
              if (saveSuccess) {
                updateProgress(100, "All expenses saved successfully!");
                setProcessingComplete(true);
                
                if (onSuccess) {
                  onSuccess();
                }
                
                const event = new CustomEvent('receipt-scanned', { 
                  detail: { items: scanResults.items, timestamp: Date.now() } 
                });
                window.dispatchEvent(event);
              } else {
                updateProgress(100, "Failed to save all expenses, but form updated");
                errorScan("Failed to save expenses to database");
              }
            } else {
              if (onCapture) {
                onCapture(expenseDetails);
              }
              
              updateProgress(100, "Receipt processed successfully!");
              setProcessingComplete(true);
            }
          } catch (error) {
            console.error("Error saving expenses:", error);
            updateProgress(100, "Error saving to database");
            errorScan("Failed to save to database");
          }
        } else if (onCapture) {
          onCapture(expenseDetails);
          updateProgress(100, "Receipt processed successfully!");
          setProcessingComplete(true);
        }
      } else if (scanResults?.isTimeout) {
        timeoutScan();
      } else if (scanResults?.error) {
        errorScan(scanResults.error);
      } else {
        errorScan("Failed to extract data from receipt");
      }
    } catch (error) {
      console.error("Error in receipt scanning:", error);
      errorScan("An unexpected error occurred");
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
    processAllItems
  ]);
  
  const autoProcessReceipt = useCallback(() => {
    handleScanReceipt();
  }, [handleScanReceipt]);
  
  return {
    isScanning,
    scanProgress,
    scanTimedOut,
    scanError, // Return as string | null for detailed error messages
    statusMessage,
    handleScanReceipt,
    isAutoProcessing,
    processingComplete,
    autoProcessReceipt,
    resetScanState
  };
}
