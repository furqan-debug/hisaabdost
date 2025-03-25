import { formatDateForStorage } from './formatUtils';
import { saveExpenseFromScan } from '../services/expenseDbService';
import { toast } from 'sonner';

/**
 * Process the results of the receipt scan
 */
export function processScanResults(
  scanResult: any,
  autoSave: boolean,
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void,
  setOpen?: (open: boolean) => void
) {
  if (!scanResult || !scanResult.items || scanResult.items.length === 0) {
    console.log("No items found in scan result");
    return null;
  }
  
  console.log("Processing scan result:", scanResult);
  
  // Format all items for saving
  const formattedItems = scanResult.items.map((item: any) => ({
    description: item.name || (scanResult.merchant ? `Purchase from ${scanResult.merchant}` : "Store Purchase"),
    amount: item.amount?.replace('$', '') || scanResult.total || "0.00",
    date: formatDateForStorage(scanResult.date || item.date),
    category: item.category || "Other",
    paymentMethod: "Card", // Default assumption for receipts
    receiptUrl: scanResult.receiptUrl || null
  }));
  
  // If autoSave is enabled, save all expenses directly
  if (autoSave) {
    if (formattedItems.length > 0) {
      return saveExpenseFromScan({
        items: formattedItems,
        merchant: scanResult.merchant || "Store",
        date: scanResult.date
      })
        .then(success => {
          if (success) {
            toast.success(`Successfully saved ${formattedItems.length} expense(s) from receipt`);
            
            // Close the dialog after a short delay
            if (setOpen) {
              setTimeout(() => setOpen(false), 1000);
            }
            return true;
          } else {
            toast.error("Failed to save expenses from receipt");
            return false;
          }
        })
        .catch(error => {
          console.error("Error saving expense from scan:", error);
          toast.error("Error processing receipt");
          return false;
        });
    }
  } 
  // Otherwise, pass the main item to the onCapture callback for form update
  else if (onCapture) {
    // Get the most relevant item for form capture
    const mainItem = formattedItems[0];
    
    onCapture(mainItem);
    
    // Close the dialog if setOpen is provided
    if (setOpen) {
      setTimeout(() => setOpen(false), 1000);
    }
    
    return mainItem;
  }
  
  return formattedItems[0];
}
