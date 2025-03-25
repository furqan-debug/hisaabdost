
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
  onSuccess?: () => void;
}

export function useScanReceipt({ 
  file, 
  onCleanup, 
  onCapture, 
  autoSave = true,
  setOpen,
  onSuccess
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
  
  // Validate and format a date string
  const formatSafeDate = (dateStr: string): string => {
    try {
      // If it's already in YYYY-MM-DD format, validate it
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) return dateStr;
      }
      
      // Try to parse the date
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      // Check for DD-MM-YYYY or MM-DD-YYYY formats
      const parts = dateStr.split(/[-\/\.]/);
      if (parts.length === 3) {
        // Try both date formats
        const formats = [
          // MM-DD-YYYY
          new Date(`${parts[2]}-${parts[0]}-${parts[1]}`),
          // DD-MM-YYYY
          new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
        ];
        
        for (const date of formats) {
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
      }
      
      // Default to today if parsing fails
      return new Date().toISOString().split('T')[0];
    } catch (e) {
      console.error("Date parsing error:", e);
      return new Date().toISOString().split('T')[0];
    }
  };
  
  // Format amount removing any currency symbols and ensuring proper number format
  const formatSafeAmount = (amount: string): string => {
    if (!amount) return "0.00";
    
    // Remove currency symbols and non-numeric characters except decimal point
    let cleaned = amount.replace(/[^\d.,]/g, '');
    
    // Replace comma with dot for decimal separator if needed
    cleaned = cleaned.replace(',', '.');
    
    // Ensure it's a valid number
    const num = parseFloat(cleaned);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };
  
  // Sanitize description to ensure it's valid
  const formatSafeDescription = (desc: string): string => {
    if (!desc) return "Store Purchase";
    
    // Trim and limit length
    let cleaned = desc.trim();
    if (cleaned.length > 50) cleaned = cleaned.substring(0, 50);
    
    // Ensure first letter is capitalized
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };
  
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
        // Process the received data to ensure it's valid
        const validatedItems = result.items.map(item => ({
          ...item,
          description: formatSafeDescription(item.description),
          amount: formatSafeAmount(item.amount),
          date: formatSafeDate(item.date || result.date)
        }));
        
        // Save to session storage for the form to use
        if (onCapture && validatedItems[0]) {
          onCapture(validatedItems[0]);
        }
        
        // Save to database if autoSave is enabled
        if (autoSave) {
          await saveExpenseFromScan({
            items: validatedItems,
            merchant: result.merchant || "Store",
            date: formatSafeDate(result.date)
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
          const validatedItems = result.items.map(item => ({
            ...item,
            description: formatSafeDescription(item.description),
            amount: formatSafeAmount(item.amount),
            date: formatSafeDate(item.date || result.date)
          }));
          
          if (onCapture && validatedItems[0]) {
            onCapture(validatedItems[0]);
            
            // Save to database if autoSave is enabled
            if (autoSave) {
              await saveExpenseFromScan({
                items: validatedItems,
                merchant: result.merchant || "Store",
                date: formatSafeDate(result.date)
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
        // Process the received data to ensure it's valid
        const validatedItems = result.items.map(item => ({
          ...item,
          description: formatSafeDescription(item.description),
          amount: formatSafeAmount(item.amount),
          date: formatSafeDate(item.date || result.date)
        }));
        
        // Save to session storage for the form to use
        if (onCapture && validatedItems[0]) {
          onCapture(validatedItems[0]);
        }
        
        // Save to database if autoSave is enabled
        if (autoSave) {
          const saveResult = await saveExpenseFromScan({
            items: validatedItems,
            merchant: result.merchant || "Store",
            date: formatSafeDate(result.date)
          });
          
          if (saveResult) {
            // Success - close dialog after a short delay
            updateProgress(100, "Receipt processed and expenses saved!");
            
            setTimeout(() => {
              setIsAutoProcessing(false);
              if (onSuccess) onSuccess();
              onCleanup();
              setOpen(false);
              
              toast.success("Receipt processed and expenses saved successfully");
            }, 1000);
            return;
          } else {
            // Save failed but we have valid items
            errorScan("Failed to save expenses to database");
            setIsAutoProcessing(false);
          }
        } else {
          // Just update the form with data, don't save to database
          updateProgress(100, "Receipt data extracted!");
          
          setTimeout(() => {
            setIsAutoProcessing(false);
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
        
        setIsAutoProcessing(false);
      }
    } catch (error) {
      console.error("Error in auto-processing:", error);
      errorScan(error instanceof Error ? error.message : "An unknown error occurred");
      setIsAutoProcessing(false);
    }
  }, [file, isScanning, isAutoProcessing, updateProgress, timeoutScan, errorScan, onCapture, onCleanup, setOpen, autoSave, onSuccess]);
  
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
