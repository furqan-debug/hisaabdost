
import { toast } from "sonner";
import { ExpenseFormData, ScanResult } from "./types";
import { useReceiptDateParser } from "./useReceiptDateParser";

interface UseReceiptScannerProps {
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptScanner({ updateField }: UseReceiptScannerProps) {
  const { parseReceiptDate } = useReceiptDateParser();

  const handleScanComplete = (expenseDetails: ScanResult) => {
    console.log("Receipt scan completed with details:", expenseDetails);
    
    // Handle date first to ensure it's in the right format
    if (expenseDetails.date) {
      const formattedDate = parseReceiptDate(expenseDetails.date);
      if (formattedDate) {
        updateField('date', formattedDate);
      } else {
        // Default to today if parsing fails
        updateField('date', new Date().toISOString().split('T')[0]);
      }
    }
    
    // Handle description (store or item name)
    if (expenseDetails.description && expenseDetails.description.trim().length > 2) {
      updateField('description', expenseDetails.description.trim());
    }
    
    // Handle amount
    if (expenseDetails.amount && !isNaN(parseFloat(expenseDetails.amount))) {
      const amount = parseFloat(expenseDetails.amount);
      if (amount > 0) {
        updateField('amount', expenseDetails.amount);
      }
    }
    
    // Handle category based on the context
    if (expenseDetails.category) {
      let category = expenseDetails.category;
      
      // Map categories to our application's categories
      if (category === "Food" || category === "Drinks" || category === "Restaurant") {
        category = "Restaurant";
      } else if (category === "Groceries" || category === "Produce") {
        category = "Groceries";
      } else if (category === "Household") {
        category = "Household";
      } else if (category === "Shopping") {
        category = "Shopping";
      }
      
      updateField('category', category);
    }
    
    // Handle payment method
    if (expenseDetails.paymentMethod && expenseDetails.paymentMethod.trim().length > 0) {
      // Map payment methods to our application's payment methods
      let paymentMethod = expenseDetails.paymentMethod;
      
      if (paymentMethod === "Credit Card" || paymentMethod === "Debit Card") {
        paymentMethod = "Card";
      }
      
      updateField('paymentMethod', paymentMethod);
    } else {
      // Default to Card
      updateField('paymentMethod', "Card");
    }
    
    toast.success("Receipt data extracted successfully! Please review before submitting.");
  };

  return { handleScanComplete };
}
