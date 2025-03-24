
import { useEffect } from 'react';
import { toast } from 'sonner';

interface UseScanResultsProps {
  isScanning: boolean;
  scanTimedOut: boolean;
  autoSave: boolean;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  setOpen: (open: boolean) => void;
  onCleanup: () => void;
}

export function useScanResults({
  isScanning,
  scanTimedOut,
  autoSave,
  onCapture,
  setOpen,
  onCleanup
}: UseScanResultsProps) {
  // Effect to handle scan results when scanning completes
  useEffect(() => {
    // This effect runs when scanning is complete
    if (!isScanning && !scanTimedOut) {
      // Check for last scan result
      try {
        const lastScanResultJson = sessionStorage.getItem('lastScanResult');
        if (lastScanResultJson) {
          const lastScanResult = JSON.parse(lastScanResultJson);
          console.log("Processing scan result:", lastScanResult);
          
          if (lastScanResult.items && lastScanResult.items.length > 0) {
            // Process scan results
            processScanResults(lastScanResult, autoSave, onCapture, setOpen);
            
            // Clear the stored result after processing
            sessionStorage.removeItem('lastScanResult');
          }
        }
      } catch (error) {
        console.error("Error processing scan results:", error);
      }
    }
    
    // Handle timeout case
    if (scanTimedOut) {
      toast.error("Receipt scanning took too long. Please try again or enter details manually.");
    }
  }, [isScanning, scanTimedOut, autoSave, onCapture, setOpen]);

  // Effect for cleanup when unmounting
  useEffect(() => {
    return () => {
      // Cleanup function runs when component unmounts
      sessionStorage.removeItem('lastScanResult');
      onCleanup();
    };
  }, [onCleanup]);
}

// Process scan results and extract expense details
function processScanResults(
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

// Find the most relevant item from a list of extracted items
function findMainItem(items: any[]): any {
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

// Clean up item description for better readability
function cleanItemDescription(description: string): string {
  if (!description) return '';
  
  // Clean up common prefixes and codes
  let cleaned = description
    .replace(/^[\d#]+\s+/, '')        // Remove leading numbers/codes
    .replace(/^[a-z]{1,3}\d{4,}\s+/i, '') // Remove SKU/product codes
    .replace(/\(\d+\s*[xX]\)/i, '')   // Remove quantity indicators
    .replace(/\s{2,}/g, ' ');         // Remove extra spaces
  
  // Truncate very long descriptions
  if (cleaned.length > 40) {
    cleaned = cleaned.substring(0, 40) + '...';
  }
  
  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// Format date from receipt for the expense form
function formatDateForForm(dateString: string): string {
  if (!dateString) return '';
  
  try {
    // If already in ISO format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Parse various date formats
    const date = new Date(dateString);
    
    // Validate date
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    // Format as YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return new Date().toISOString().split('T')[0];
  }
}
