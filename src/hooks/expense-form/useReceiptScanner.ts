
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
    
    // Process and validate date
    if (scanResult.date) {
      const formattedDate = parseReceiptDate(scanResult.date);
      updateField('date', formattedDate);
    } else {
      // Default to today if no date
      updateField('date', new Date().toISOString().split('T')[0]);
    }
    
    // Process description - simple cleanup
    if (scanResult.description && scanResult.description.trim().length > 0) {
      const cleanDescription = scanResult.description
        .trim()
        .replace(/[^\w\s\-',&]/g, '')  // Remove special chars except basic ones
        .replace(/\s{2,}/g, ' ');       // Replace multiple spaces
      
      updateField('description', cleanDescription);
    }
    
    // Process amount - simple numeric validation
    if (scanResult.amount) {
      // Remove any non-numeric characters except decimal point
      const cleanAmount = scanResult.amount.replace(/[^\d.]/g, '');
      const parsedAmount = parseFloat(cleanAmount);
      
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        updateField('amount', cleanAmount);
      } else {
        console.warn("Invalid amount from receipt scan:", scanResult.amount);
      }
    }
    
    // Set a default category rather than trying to be clever
    updateField('category', 'Shopping');
    
    // Set a default payment method
    updateField('paymentMethod', 'Card');
    
    toast.success("Receipt data extracted! Please review before submitting.");
  };

  return { handleScanComplete };
}
