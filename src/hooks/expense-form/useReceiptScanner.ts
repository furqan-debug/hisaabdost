
import { useCallback } from "react";
import { ExpenseFormData } from "./types";

interface UseReceiptScannerProps {
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptScanner({ updateField }: UseReceiptScannerProps) {
  // Handle receipt scan completion - updates form fields with data from scan result
  const handleScanComplete = useCallback(() => {
    try {
      // Check if we have scan results stored in session
      const lastScanResultJson = sessionStorage.getItem('lastScanResult');
      if (!lastScanResultJson) return;
      
      const lastScanResult = JSON.parse(lastScanResultJson);
      console.log("Processing scan result:", lastScanResult);
      
      if (lastScanResult.items && lastScanResult.items.length > 0) {
        // Get most relevant item (first item or most expensive)
        const mainItem = lastScanResult.items[0];
        
        // Update merchant/description
        if (mainItem.name) {
          updateField('description', mainItem.name);
        } else if (lastScanResult.storeName) {
          updateField('description', `Purchase from ${lastScanResult.storeName}`);
        }
        
        // Update amount
        if (mainItem.amount) {
          updateField('amount', mainItem.amount);
        }
        
        // Update date if available
        if (mainItem.date) {
          updateField('date', mainItem.date);
        }
        
        // Update category if available
        if (mainItem.category) {
          updateField('category', mainItem.category);
        }
        
        // Default payment method to Card
        updateField('paymentMethod', 'Card');
        
        // Clear the scan result after using it
        sessionStorage.removeItem('lastScanResult');
      }
    } catch (error) {
      console.error("Error handling scan completion:", error);
    }
  }, [updateField]);

  return { handleScanComplete };
}
