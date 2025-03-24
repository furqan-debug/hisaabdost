
import { useEffect } from 'react';
import { toast } from 'sonner';
import { formatDateForStorage, calculateTotal } from '../utils/formatUtils';
import { processScanResults } from '../utils/processScanUtils';
import { saveMultipleExpensesFromReceipt } from '@/services/expenseService';

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
            // Save all items to database if auto-save is enabled
            if (autoSave) {
              saveMultipleItemsToDatabase(lastScanResult);
            } else {
              // Process scan results for the expense form
              processScanResults(lastScanResult, autoSave, onCapture, setOpen);
            }
            
            // Successful scan toast
            toast.success(`Found ${lastScanResult.items.length} item${lastScanResult.items.length > 1 ? 's' : ''} in receipt`);
            
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
  
  // Save multiple receipt items to database
  const saveMultipleItemsToDatabase = async (result: any) => {
    if (!result || !result.items || result.items.length === 0) return;
    
    try {
      // Format receipt data for storage
      const expenses = result.items.map((item: any) => ({
        description: item.name,
        amount: item.amount,
        date: formatDateForStorage(item.date || result.date),
        category: item.category || "Other",
        paymentMethod: "Card", // Default assumption
        receiptUrl: result.receiptUrl || "",
        merchant: result.merchant || result.storeName || "Unknown"
      }));
      
      // Save all items as separate expenses
      const success = await saveMultipleExpensesFromReceipt(expenses);
      if (success) {
        toast.success(`Saved ${expenses.length} expense${expenses.length > 1 ? 's' : ''} from receipt`);
        
        // Close the dialog after successful save
        setTimeout(() => {
          setOpen(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to save receipt items to database:", error);
      toast.error("Failed to save some or all items. Please try again.");
    }
  };
}
