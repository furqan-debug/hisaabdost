import { toast } from "sonner";
import { ExpenseFormData, ScanResult } from "./types";
import { useReceiptDateParser } from "./useReceiptDateParser";

interface UseReceiptScannerProps {
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptScanner({ updateField }: UseReceiptScannerProps) {
  const { parseReceiptDate } = useReceiptDateParser();

  const handleScanComplete = (scanResult: ScanResult) => {
    console.log("Receipt scan completed with details:", scanResult);
    
    // Process merchant/store name for description if available
    if (scanResult.storeName && scanResult.storeName.trim().length > 0) {
      const cleanStoreName = scanResult.storeName
        .trim()
        .replace(/[^\w\s\-',&]/g, '')  // Remove special chars except basic ones
        .replace(/\s{2,}/g, ' ');      // Replace multiple spaces
      
      updateField('description', `Groceries from ${cleanStoreName}`);
    }
    // Otherwise use description or default
    else if (scanResult.description && scanResult.description.trim().length > 0) {
      const cleanDescription = scanResult.description
        .trim()
        .replace(/[^\w\s\-',&]/g, '')  // Remove special chars except basic ones
        .replace(/\s{2,}/g, ' ');       // Replace multiple spaces
      
      updateField('description', cleanDescription);
    } else {
      updateField('description', 'Grocery Shopping');
    }
    
    // Process and validate date
    if (scanResult.date) {
      const formattedDate = parseReceiptDate(scanResult.date);
      updateField('date', formattedDate);
    } else {
      // Default to today if no date
      updateField('date', new Date().toISOString().split('T')[0]);
    }
    
    // Process amount - accurately extract the total
    if (scanResult.amount) {
      // Remove any non-numeric characters except decimal point
      const cleanAmount = scanResult.amount.replace(/[^\d.]/g, '');
      const parsedAmount = parseFloat(cleanAmount);
      
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        updateField('amount', cleanAmount);
      } else {
        console.warn("Invalid amount from receipt scan:", scanResult.amount);
        // Don't set an invalid amount
      }
    }
    
    // Set Groceries category for supermarket receipts
    if (scanResult.storeName && 
        (scanResult.storeName.toLowerCase().includes('supermarket') || 
         scanResult.storeName.toLowerCase().includes('grocery') ||
         scanResult.storeName.toLowerCase().includes('food'))) {
      updateField('category', 'Groceries');
    } else if (scanResult.category) {
      updateField('category', scanResult.category);
    } else {
      // Default to Groceries as most receipt scans are likely groceries
      updateField('category', 'Groceries');
    }
    
    // Set a default payment method
    updateField('paymentMethod', 'Card');
    
    toast.success("Receipt data extracted! Please review before submitting.");
  };

  return { handleScanComplete };
}
