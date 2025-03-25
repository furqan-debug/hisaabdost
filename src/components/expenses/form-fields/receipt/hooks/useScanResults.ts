
import { useEffect } from 'react';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';
import { calculateTotal } from '../utils/formatUtils';
import { processScanResults } from '../utils/processScanUtils';
import { saveExpenseFromScan } from '../services/expenseDbService';

interface UseScanResultsProps {
  isScanning: boolean;
  scanTimedOut: boolean;
  scanError?: string;
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
  scanError,
  autoSave,
  onCapture,
  setOpen,
  onCleanup
}: UseScanResultsProps) {
  // Effect to handle scan results when scanning completes
  useEffect(() => {
    // This effect runs when scanning is complete
    if (!isScanning && !scanTimedOut && !scanError) {
      // Check for last scan result
      try {
        const lastScanResultJson = sessionStorage.getItem('lastScanResult');
        if (lastScanResultJson) {
          const lastScanResult = JSON.parse(lastScanResultJson);
          console.log("Processing scan result:", lastScanResult);
          
          if (lastScanResult.items && lastScanResult.items.length > 0) {
            // Save all items to database if auto-save is enabled
            if (autoSave) {
              saveExpenseFromScan(lastScanResult)
                .then(success => {
                  if (success) {
                    toast.success(`Successfully saved ${lastScanResult.items.length} expense(s) from receipt`);
                    
                    // Close the dialog after a short delay
                    setTimeout(() => {
                      setOpen(false);
                    }, 1000);
                  } else {
                    toast.error("Failed to save expenses from receipt");
                  }
                })
                .catch(error => {
                  console.error("Error saving expense from scan:", error);
                  toast.error("Error processing receipt");
                });
            } else {
              // Process scan results for the expense form
              processScanResults(lastScanResult, autoSave, onCapture, setOpen);
              
              // Successful scan toast
              toast.success(`Found ${lastScanResult.items.length} item${lastScanResult.items.length > 1 ? 's' : ''} in receipt`);
              
              // Close the dialog after a short delay to show success message
              setTimeout(() => {
                setOpen(false);
              }, 1000);
            }
            
            // Clear the stored result after processing
            sessionStorage.removeItem('lastScanResult');
          } else {
            toast.warning("Receipt scanned, but no items were detected.");
            
            // Close the dialog after a short delay even if no items detected
            setTimeout(() => {
              setOpen(false);
            }, 1500);
          }
        }
      } catch (error) {
        console.error("Error processing scan results:", error);
        toast.error("Error processing scan results.");
      }
    }
    
    // Handle error cases
    if (scanTimedOut) {
      toast.error("Receipt scanning took too long. Please try again with a clearer image.");
    } else if (scanError) {
      toast.error(scanError);
    }
  }, [isScanning, scanTimedOut, scanError, autoSave, onCapture, setOpen]);

  // Effect for cleanup when unmounting
  useEffect(() => {
    return () => {
      // Cleanup function runs when component unmounts
      sessionStorage.removeItem('lastScanResult');
      onCleanup();
    };
  }, [onCleanup]);
}
