
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
    // Get the first or most expensive item
    const mainItem = result.items[0];
    
    // Extract expense details
    const expenseDetails = {
      description: mainItem.name || (result.storeName ? `Purchase from ${result.storeName}` : "Store Purchase"),
      amount: mainItem.amount || "0.00",
      date: result.date || new Date().toISOString().split('T')[0],
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
