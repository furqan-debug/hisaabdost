
import { useState, useCallback } from 'react';
import { scanReceipt } from '../services/receiptScannerService';
import { saveExpenseFromScan } from '../services/expenseDbService';
import { toast } from 'sonner';
import { selectMainItem } from '../utils/itemSelectionUtils';

interface ScanResult {
  date?: string;
  total?: string;
  items?: any[];
  merchant?: string;
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
  processAllItems = true // Changed to true by default to ensure automatic processing
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
      return false;
    }
    
    if (isScanning) {
      toast.info("Scan already in progress");
      return false;
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
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Always prioritize the current date if no date was found
        let expenseDetails = {
          description: mainItem.description || scanResults.merchant || "Store Purchase",
          amount: mainItem.amount || scanResults.total || "0.00",
          date: mainItem.date || scanResults.date || currentDate,
          category: mainItem.category || "Other",
          paymentMethod: mainItem.paymentMethod || "Card",
        };
        
        // Log the date extraction for debugging
        console.log("Receipt date processing:", {
          itemDate: mainItem.date,
          scanResultsDate: scanResults.date,
          finalDate: expenseDetails.date,
          usedCurrentDate: !mainItem.date && !scanResults.date
        });
        
        if (autoSave) {
          try {
            updateProgress(95, "Saving expenses to database...");
            
            if (processAllItems && scanResults.items.length >= 1) {
              // Always process all items from the receipt
              const receiptData = {
                items: scanResults.items,
                merchant: scanResults.merchant || mainItem.description || "Store",
                date: scanResults.date || currentDate,
                receiptUrl: scanResults.receiptUrl
              };
              
              const saveSuccess = await saveExpenseFromScan(receiptData);
              
              if (saveSuccess) {
                updateProgress(100, "All expenses saved successfully!");
                setProcessingComplete(true);
                
                if (onSuccess) {
                  onSuccess();
                }
                
                // Dispatch event to refresh expense list
                const event = new CustomEvent('receipt-scanned', { 
                  detail: { items: scanResults.items, timestamp: Date.now() } 
                });
                window.dispatchEvent(event);
                
                // Also dispatch the standard expenses-updated event
                const updateEvent = new CustomEvent('expenses-updated', { 
                  detail: { timestamp: Date.now() } 
                });
                window.dispatchEvent(updateEvent);
                
                // Close the dialog automatically after successful processing
                setTimeout(() => {
                  setOpen(false);
                }, 1500);
                
                return true;
              } else {
                updateProgress(100, "Failed to save all expenses");
                errorScan("Failed to save expenses to database");
                return false;
              }
            } else {
              if (onCapture) {
                onCapture(expenseDetails);
              }
              
              updateProgress(100, "Receipt processed successfully!");
              setProcessingComplete(true);
              return true;
            }
          } catch (error) {
            console.error("Error saving expenses:", error);
            updateProgress(100, "Error saving to database");
            errorScan("Failed to save to database");
            return false;
          }
        } else if (onCapture) {
          onCapture(expenseDetails);
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
