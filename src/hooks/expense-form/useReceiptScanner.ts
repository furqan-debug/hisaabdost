
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
      if (formattedDate) {
        updateField('date', formattedDate);
      } else {
        // Default to today if parsing fails
        updateField('date', new Date().toISOString().split('T')[0]);
      }
    }
    
    // Process and validate description
    if (scanResult.description && scanResult.description.trim().length > 1) {
      // Clean up description - remove any special characters except basic punctuation
      const cleanDescription = scanResult.description
        .trim()
        .replace(/[^\w\s\-',&]/g, '')  // Remove special chars except those listed
        .replace(/\s{2,}/g, ' ');       // Replace multiple spaces with single space
      
      updateField('description', cleanDescription);
    }
    
    // Process and validate amount
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
    
    // Process category with better validation
    if (scanResult.category && scanResult.category.trim().length > 0) {
      // Map common categories to our application's categories
      let mappedCategory = scanResult.category.trim();
      
      const categoryMap = {
        'food': 'Restaurant',
        'meal': 'Restaurant',
        'restaurant': 'Restaurant',
        'café': 'Restaurant',
        'cafe': 'Restaurant',
        'coffee': 'Restaurant',
        'diner': 'Restaurant', 
        'groceries': 'Groceries',
        'grocery': 'Groceries',
        'supermarket': 'Groceries',
        'market': 'Groceries',
        'produce': 'Groceries',
        'household': 'Household',
        'home': 'Household',
        'shopping': 'Shopping',
        'retail': 'Shopping',
        'store': 'Shopping',
        'merchandise': 'Shopping',
        'transport': 'Transportation',
        'transportation': 'Transportation',
        'travel': 'Transportation',
        'transit': 'Transportation',
        'uber': 'Transportation',
        'entertainment': 'Entertainment',
        'movie': 'Entertainment',
        'cinema': 'Entertainment'
      };
      
      // Try to match category to our predefined categories
      const lowerCategory = mappedCategory.toLowerCase();
      for (const [key, value] of Object.entries(categoryMap)) {
        if (lowerCategory.includes(key)) {
          mappedCategory = value;
          break;
        }
      }
      
      // Verify it's a valid category and update
      const validCategories = [
        'Groceries', 'Restaurant', 'Shopping', 
        'Transportation', 'Entertainment', 'Utilities', 
        'Healthcare', 'Household', 'Education', 'Other'
      ];
      
      if (validCategories.includes(mappedCategory)) {
        updateField('category', mappedCategory);
      } else {
        // Default to a safe category if mapping failed
        updateField('category', 'Other');
      }
    }
    
    // Process payment method
    if (scanResult.paymentMethod && scanResult.paymentMethod.trim().length > 0) {
      const paymentMethod = scanResult.paymentMethod.trim();
      const lowerPayment = paymentMethod.toLowerCase();
      
      // Map payment methods to our application's options
      if (lowerPayment.includes('card') || 
          lowerPayment.includes('credit') || 
          lowerPayment.includes('visa') || 
          lowerPayment.includes('master') || 
          lowerPayment.includes('debit')) {
        updateField('paymentMethod', 'Card');
      } else if (lowerPayment.includes('cash')) {
        updateField('paymentMethod', 'Cash');
      } else if (lowerPayment.includes('transfer') || 
                lowerPayment.includes('bank') || 
                lowerPayment.includes('wire')) {
        updateField('paymentMethod', 'Transfer');
      } else if (lowerPayment.includes('mobile') || 
                lowerPayment.includes('app') || 
                lowerPayment.includes('phone')) {
        updateField('paymentMethod', 'Mobile Payment');
      } else {
        // Default to Card as most common method
        updateField('paymentMethod', 'Card');
      }
    } else {
      // Default to Card
      updateField('paymentMethod', 'Card');
    }
    
    toast.success("Receipt data extracted successfully! Please review before submitting.");
  };

  return { handleScanComplete };
}
