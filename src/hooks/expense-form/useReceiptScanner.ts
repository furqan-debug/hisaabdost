
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
    
    // Determine the best category based on the scan context
    let category = expenseDetails.category || "Shopping";
    
    // If the description contains restaurant-related words, use Restaurant category
    if (expenseDetails.description) {
      const lowerDesc = expenseDetails.description.toLowerCase();
      if (lowerDesc.includes("restaurant") || 
          lowerDesc.includes("dining") || 
          lowerDesc.includes("cafe") || 
          lowerDesc.includes("bar") ||
          lowerDesc.includes("grill")) {
        category = "Restaurant";
      }
    }
    
    // Handle category assignment for menu items
    if (expenseDetails.category === "Food" || 
        expenseDetails.category === "Drinks" || 
        expenseDetails.category === "Restaurant") {
      category = "Restaurant";
    }
    
    // Update category first so other fields have context
    updateField('category', category);
    
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
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(today.getFullYear() - 10);
        
        if (dateObj <= today && dateObj >= tenYearsAgo) {
          updateField('date', formattedDate);
        } else {
          console.warn("Rejected invalid date:", formattedDate);
          // Use today's date as fallback
          updateField('date', new Date().toISOString().split('T')[0]);
        }
      }
    }
    
    // For payment method, respect what's provided, with fallbacks based on context
    if (expenseDetails.paymentMethod && expenseDetails.paymentMethod.trim().length > 0) {
      updateField('paymentMethod', expenseDetails.paymentMethod);
    } else if (category === "Restaurant") {
      // Default to Card for restaurant receipts
      updateField('paymentMethod', "Card");
    } else {
      // Default to Card for other receipts
      updateField('paymentMethod', "Card");
    }
    
    toast.success("Receipt data extracted and filled in! Please review before submitting.");
  };

  return { handleScanComplete };
}
