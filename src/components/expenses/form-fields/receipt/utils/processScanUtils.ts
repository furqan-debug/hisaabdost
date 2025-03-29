
import { formatDate } from './dateUtils';
import { saveExpenseFromScan } from '../services/expenseDbService';
import { toast } from 'sonner';

/**
 * Process the results of the receipt scan
 */
export async function processScanResults(
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
): Promise<boolean> {
  console.log("Processing scan result:", scanResult);
  
  if (!scanResult || !scanResult.items || scanResult.items.length === 0) {
    console.log("No items found in scan result");
    toast.error("No items found in receipt");
    return false;
  }
  
  // Format all items for saving, ensuring all required fields are present
  const formattedItems = scanResult.items.map((item: any) => ({
    description: item.name || (scanResult.merchant ? `Purchase from ${scanResult.merchant}` : "Store Purchase"),
    amount: item.amount?.toString().replace('$', '') || scanResult.total?.toString() || "0.00",
    date: formatDate(scanResult.date || item.date || new Date().toISOString().split('T')[0]),
    category: item.category || "Food", // Default to Food if no category
    paymentMethod: "Card", // Default assumption for receipts
    receiptUrl: scanResult.receiptUrl || null
  }));
  
  // Log the formatted items
  console.log("Formatted items for processing:", formattedItems);
  
  // Always save all expenses automatically regardless of autoSave flag
  if (formattedItems.length > 0) {
    try {
      const success = await saveExpenseFromScan({
        items: formattedItems,
        merchant: scanResult.merchant || scanResult.storeName || "Store",
        date: scanResult.date
      });
      
      if (success) {
        toast.success(`Successfully saved ${formattedItems.length} expense(s) from receipt`);
        
        // If onCapture is provided, also update the form with the first item
        if (onCapture && formattedItems.length > 0) {
          onCapture(formattedItems[0]);
        }
        
        // Close the dialog after a short delay
        if (setOpen) {
          setTimeout(() => setOpen(false), 1000);
        }
        return true;
      } else {
        toast.error("Failed to save expenses from receipt");
        
        // Even if saving to database failed, still update the form if onCapture is provided
        if (onCapture && formattedItems.length > 0) {
          onCapture(formattedItems[0]);
        }
        return false;
      }
    } catch (error) {
      console.error("Error saving expense from scan:", error);
      toast.error("Error processing receipt");
      
      // Even if an error occurred, still update the form if onCapture is provided
      if (onCapture && formattedItems.length > 0) {
        onCapture(formattedItems[0]);
      }
      return false;
    }
  } else {
    toast.error("No valid items found in receipt");
    return false;
  }
}
