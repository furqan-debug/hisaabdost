
import { useEffect } from 'react';
import { toast } from 'sonner';
import { processScanResults } from '../utils/processScanUtils';

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
    // This effect runs when scanning is complete (not scanning, not timed out, no error)
    if (!isScanning && !scanTimedOut && !scanError) {
      // Check for last scan result
      try {
        const lastScanResultJson = sessionStorage.getItem('lastScanResult');
        if (lastScanResultJson) {
          const lastScanResult = JSON.parse(lastScanResultJson);
          console.log("Processing scan result from session:", lastScanResult);
          
          if (lastScanResult.items && lastScanResult.items.length > 0) {
            // Process scan results - this handles both auto-save and form update modes
            processScanResults(lastScanResult, autoSave, onCapture, setOpen)
              .then(success => {
                console.log("Scan processing result:", success);
                
                // If processing was successful, dispatch events to update the expense list
                if (success) {
                  // Dispatch the custom event with a delay to ensure DB operations are complete
                  setTimeout(() => {
                    const event = new CustomEvent('expenses-updated', { 
                      detail: { timestamp: Date.now() }
                    });
                    window.dispatchEvent(event);
                    console.log("Dispatched expenses-updated event after processing scan results");
                  }, 1000);
                }
                
                // Clear the stored result after processing
                setTimeout(() => {
                  sessionStorage.removeItem('lastScanResult');
                }, 1500);
                
                if (!success && autoSave) {
                  toast.error("Failed to save expenses from receipt");
                }
              })
              .catch(error => {
                console.error("Error in scan processing:", error);
                toast.error("Error processing scan results");
                
                // Clear the stored result
                sessionStorage.removeItem('lastScanResult');
              });
          } else {
            toast.warning("Receipt scanned, but no items were detected.");
            
            // Close the dialog after a short delay even if no items detected
            setTimeout(() => {
              setOpen(false);
              // Clear the stored result
              sessionStorage.removeItem('lastScanResult');
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
      onCleanup();
    };
  }, [onCleanup]);
}
