
import { formatDateForStorage } from './formatUtils';

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
  if (!scanResult.items || scanResult.items.length === 0) {
    console.log("No items found in scan result");
    return;
  }
  
  // Get the most relevant item (usually the first one or one with highest amount)
  const mainItem = scanResult.items.reduce((highest: any, current: any) => {
    if (!highest) return current;
    
    const highestAmount = parseFloat(highest.amount || '0');
    const currentAmount = parseFloat(current.amount || '0');
    
    return currentAmount > highestAmount ? current : highest;
  }, null);
  
  if (!mainItem) return;
  
  // Format the expense details for the form
  const expenseDetails = {
    description: mainItem.name || (scanResult.merchant ? `Purchase from ${scanResult.merchant}` : "Store Purchase"),
    amount: mainItem.amount || scanResult.total || "0.00",
    date: formatDateForStorage(scanResult.date),
    category: mainItem.category || "Other",
    paymentMethod: "Card" // Default assumption for receipts
  };
  
  // Pass the details to the onCapture callback if provided
  if (onCapture) {
    onCapture(expenseDetails);
  }
  
  // Close the dialog if autoSave is enabled and setOpen is provided
  if (autoSave && setOpen) {
    setTimeout(() => setOpen(false), 1000);
  }
  
  return expenseDetails;
}
