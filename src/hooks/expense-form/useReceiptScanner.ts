
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
    
    if (expenseDetails.description && expenseDetails.description.trim().length > 0) {
      updateField('description', expenseDetails.description);
    }
    
    if (expenseDetails.amount && !isNaN(parseFloat(expenseDetails.amount))) {
      const amount = parseFloat(expenseDetails.amount);
      if (amount > 0) {
        updateField('amount', expenseDetails.amount);
      }
    }
    
    if (expenseDetails.date) {
      const formattedDate = parseReceiptDate(expenseDetails.date);
      if (formattedDate) {
        updateField('date', formattedDate);
      }
    }
    
    if (expenseDetails.category) {
      updateField('category', expenseDetails.category);
    } else {
      // Default to Shopping for receipts
      updateField('category', 'Shopping');
    }
    
    if (expenseDetails.paymentMethod) {
      updateField('paymentMethod', expenseDetails.paymentMethod);
    }
    
    toast.success("Receipt data extracted and filled in! Please review before submitting.");
  };

  return { handleScanComplete };
}
