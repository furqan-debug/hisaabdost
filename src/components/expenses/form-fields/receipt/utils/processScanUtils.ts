
import { toast } from 'sonner';
import { cleanItemDescription, formatDateForForm } from './formatUtils';

// Find the most relevant item from a list of extracted items
export function findMainItem(items: any[]): any {
  if (!items || items.length === 0) return {};
  
  // If there's only one item, use it
  if (items.length === 1) return items[0];
  
  // Sort by price (highest first) and return the most expensive item
  const sortedItems = [...items].sort((a, b) => {
    const amountA = parseFloat(a.amount || '0');
    const amountB = parseFloat(b.amount || '0');
    return amountB - amountA;
  });
  
  return sortedItems[0];
}

// Process scan results and extract expense details
export function processScanResults(
  result: any, 
  autoSave: boolean,
  onCapture?: (expenseDetails: any) => void,
  setOpen?: (open: boolean) => void
) {
  if (!result || !result.items || result.items.length === 0) {
    console.warn("No items found in scan result");
    return;
  }
  
  // If autosave is enabled, handle all items
  if (autoSave) {
    toast.success(`Found ${result.items.length} items to add`);
    // This would be implemented for batch adding expenses
    console.log("Auto-saving items:", result.items);
    return;
  }
  
  // For single item capture
  if (onCapture) {
    // Get the most relevant item - typically the most expensive one
    const mainItem = findMainItem(result.items);
    
    // Extract expense details
    const expenseDetails = {
      description: cleanItemDescription(mainItem.name) || (result.storeName ? `Purchase from ${result.storeName}` : "Store Purchase"),
      amount: mainItem.amount || "0.00",
      date: formatDateForForm(mainItem.date) || new Date().toISOString().split('T')[0],
      category: mainItem.category || "Other",
      paymentMethod: "Card"
    };
    
    console.log("Captured expense details:", expenseDetails);
    
    // Notify and update form
    toast.success("Receipt scanned successfully!");
    onCapture(expenseDetails);
    
    // Close dialog if needed
    if (setOpen) {
      setTimeout(() => setOpen(false), 500);
    }
  }
}
