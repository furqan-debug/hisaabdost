
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
        const mainItem = selectMainItem(lastScanResult.items);
        
        // Update merchant/description
        if (mainItem.name) {
          updateField('description', cleanDescription(mainItem.name));
        } else if (lastScanResult.storeName) {
          updateField('description', `Purchase from ${lastScanResult.storeName}`);
        }
        
        // Update amount
        if (mainItem.amount) {
          updateField('amount', mainItem.amount);
        }
        
        // Update date if available
        if (mainItem.date) {
          updateField('date', formatReceiptDate(mainItem.date));
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

// Helper function to select the most relevant item from scan results
function selectMainItem(items: any[]): any {
  if (!items || items.length === 0) return {};
  
  // If there's only one item, use it
  if (items.length === 1) return items[0];
  
  // Try to find the item with the highest amount (likely the main purchase)
  return items.reduce((highest, current) => {
    const highestAmount = parseFloat(highest.amount || '0');
    const currentAmount = parseFloat(current.amount || '0');
    return currentAmount > highestAmount ? current : highest;
  }, items[0]);
}

// Clean up the description to make it more readable
function cleanDescription(description: string): string {
  if (!description) return '';
  
  // Remove common receipt prefixes
  let cleaned = description
    .replace(/^item[:.\s-]+/i, '')
    .replace(/^product[:.\s-]+/i, '')
    .replace(/^[a-z]{1,3}\d{4,}[:.\s-]*/i, ''); // Remove SKU/UPC codes
  
  // Truncate very long descriptions
  if (cleaned.length > 50) {
    cleaned = cleaned.substring(0, 50) + '...';
  }
  
  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned;
}

// Format receipt date to YYYY-MM-DD for the form
function formatReceiptDate(dateString: string): string {
  try {
    // If the date is already in ISO format (YYYY-MM-DD), return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Parse the date string
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    // Format as YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error formatting receipt date:", error);
    return new Date().toISOString().split('T')[0];
  }
}
