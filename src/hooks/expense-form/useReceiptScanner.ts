
import { toast } from "sonner";
import { ExpenseFormData, ScanResult } from "./types";
import { useReceiptDateParser } from "./useReceiptDateParser";

interface UseReceiptScannerProps {
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptScanner({ updateField }: UseReceiptScannerProps) {
  const { parseReceiptDate } = useReceiptDateParser();

  const handleScanComplete = (expenseDetails: ScanResult) => {
    console.log("Handling scan complete with details:", expenseDetails);
    
    // Carefully validate and update each field if present
    if (expenseDetails.description && expenseDetails.description.trim().length > 2) {
      // Trim whitespace and make sure description is presentable
      const cleanDescription = expenseDetails.description.trim()
        .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
        .replace(/[^\w\s\-',.&]/g, ''); // Remove special chars except basic punctuation
      
      if (cleanDescription.length > 2) {
        updateField('description', cleanDescription);
      }
    }
    
    if (expenseDetails.amount && !isNaN(parseFloat(expenseDetails.amount))) {
      const amount = parseFloat(expenseDetails.amount);
      // Only use positive, non-zero amounts
      if (amount > 0 && amount < 100000) { // Also guard against unreasonably large amounts
        updateField('amount', expenseDetails.amount);
      }
    }
    
    if (expenseDetails.date) {
      const formattedDate = parseReceiptDate(expenseDetails.date);
      if (formattedDate) {
        // Validate this is a reasonable date (not in future, not too far in past)
        const dateObj = new Date(formattedDate);
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        if (dateObj <= today && dateObj >= oneYearAgo) {
          updateField('date', formattedDate);
        } else {
          console.warn("Rejected invalid date:", formattedDate);
          // Use today's date as fallback
          updateField('date', new Date().toISOString().split('T')[0]);
        }
      }
    }
    
    if (expenseDetails.category && expenseDetails.category.trim().length > 0) {
      updateField('category', expenseDetails.category);
    } else {
      // Default to Shopping for receipts
      updateField('category', 'Shopping');
    }
    
    if (expenseDetails.paymentMethod && expenseDetails.paymentMethod.trim().length > 0) {
      updateField('paymentMethod', expenseDetails.paymentMethod);
    }
    
    toast.success("Receipt data extracted and filled in! Please review before submitting.");
  };

  return { handleScanComplete };
}
