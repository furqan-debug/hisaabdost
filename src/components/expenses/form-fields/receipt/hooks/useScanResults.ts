
import { useEffect } from 'react';
import { toast } from 'sonner';
import { formatDateForStorage, calculateTotal } from '../utils/formatUtils';
import { processScanResults } from '../utils/processScanUtils';
import { saveReceiptExtraction } from '@/services/receiptService';

interface UseScanResultsProps {
  isScanning: boolean;
  scanTimedOut: boolean;
  scanError?: string;
  autoSave: boolean;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  setOpen: (open: boolean) => void;
  onCleanup: () => void;
}

export function useScanResults({
  isScanning,
  scanTimedOut,
  scanError,
  autoSave,
  onCapture,
  setOpen,
  onCleanup
}: UseScanResultsProps) {
  // Effect to handle scan results when scanning completes
  useEffect(() => {
    // This effect runs when scanning is complete
    if (!isScanning && !scanTimedOut && !scanError) {
      // Check for last scan result
      try {
        const lastScanResultJson = sessionStorage.getItem('lastScanResult');
        if (lastScanResultJson) {
          const lastScanResult = JSON.parse(lastScanResultJson);
          console.log("Processing scan result:", lastScanResult);
          
          if (lastScanResult.items && lastScanResult.items.length > 0) {
            // Save receipt data to database if user is logged in
            saveToDatabase(lastScanResult);
            
            // Process scan results for the expense form
            processScanResults(lastScanResult, autoSave, onCapture, setOpen);
            
            // Successful scan toast
            toast.success("Receipt scanned successfully!");
            
            // Clear the stored result after processing
            sessionStorage.removeItem('lastScanResult');
          } else {
            toast.warning("Receipt scanned, but no items were detected.");
          }
        }
      } catch (error) {
        console.error("Error processing scan results:", error);
        toast.error("Error processing scan results.");
      }
    }
    
    // Handle error cases
    if (scanTimedOut) {
      toast.error("Receipt scanning took too long. Please try again with a clearer image.");
    } else if (scanError) {
      toast.error(scanError);
    }
  }, [isScanning, scanTimedOut, scanError, autoSave, onCapture, setOpen]);

  // Effect for cleanup when unmounting
  useEffect(() => {
    return () => {
      // Cleanup function runs when component unmounts
      sessionStorage.removeItem('lastScanResult');
      onCleanup();
    };
  }, [onCleanup]);
  
  // Save receipt data to database
  const saveToDatabase = async (result: any) => {
    if (!result || !result.items || result.items.length === 0) return;
    
    try {
      // Format receipt data for storage
      const receiptData = {
        merchant: result.storeName || "Unknown Merchant",
        date: formatDateForStorage(result.date),
        total: calculateTotal(result.items),
        items: result.items,
        receiptUrl: result.receiptUrl || "",
        paymentMethod: "Card" // Default assumption
      };
      
      // Save to database
      const receiptId = await saveReceiptExtraction(receiptData);
      if (receiptId) {
        console.log("Receipt data saved with ID:", receiptId);
      }
    } catch (error) {
      console.error("Failed to save receipt data to database:", error);
      // Don't show error to user - this is a background operation
    }
  };
}
