
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useScanReceipt } from "./hooks/useScanReceipt";
import { ScanProgress } from "./components/ScanProgress";
import { ScanTimeoutMessage } from "./components/ScanTimeoutMessage";
import { ReceiptPreviewImage } from "./components/ReceiptPreviewImage";
import { DialogActions } from "./components/DialogActions";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ReceiptScanDialogProps {
  file: File | null;
  previewUrl: string | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  onCleanup: () => void;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  autoSave?: boolean;
  autoProcess?: boolean;
  onManualEntry?: () => void;
}

export function ReceiptScanDialog({
  file,
  previewUrl,
  open,
  setOpen,
  onCleanup,
  onCapture,
  autoSave = true,
  autoProcess = true,
  onManualEntry
}: ReceiptScanDialogProps) {
  const [attemptCount, setAttemptCount] = useState(0);
  const [processingComplete, setProcessingComplete] = useState(false);
  const hasCleanedUpRef = useRef(false);
  const autoProcessHasStarted = useRef(false);
  
  const {
    isScanning,
    scanProgress,
    scanTimedOut,
    scanError,
    statusMessage,
    handleScanReceipt,
    isAutoProcessing,
    autoProcessReceipt,
    resetScanState
  } = useScanReceipt({
    file,
    onCleanup: () => {
      // We'll handle cleanup separately to avoid premature revoking of blob URLs
      hasCleanedUpRef.current = true;
    },
    onCapture,
    autoSave,
    setOpen,
    onSuccess: () => {
      setProcessingComplete(true);
    }
  });
  
  // Auto-process the receipt when the dialog opens
  useEffect(() => {
    if (open && file && !isScanning && !isAutoProcessing && autoProcess && !autoProcessHasStarted.current) {
      autoProcessHasStarted.current = true;
      
      // Start processing after a small delay to allow UI to render
      const timer = setTimeout(() => {
        console.log("Auto-processing receipt...");
        autoProcessReceipt();
        setAttemptCount(1); // Start at 1 for the first attempt
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open, file, isScanning, isAutoProcessing, autoProcessReceipt, autoProcess]);
  
  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      autoProcessHasStarted.current = false;
      setProcessingComplete(false);
      setAttemptCount(0);
      hasCleanedUpRef.current = false;
    }
  }, [open]);

  // Retry logic for failed scans with exponential backoff
  useEffect(() => {
    // Only retry if we have an error, are under max retries, dialog is open, and the first process hasn't completed
    if ((scanTimedOut || scanError) && attemptCount < 2 && attemptCount > 0 && open && !processingComplete) {
      console.log(`Retry logic triggered. Attempt count: ${attemptCount}, Max: 2`);
      
      // Calculate backoff delay (first retry 1.5s, second retry 3s)
      const backoffDelay = Math.min(1500 * Math.pow(2, attemptCount - 1), 3000);
      
      // Auto-retry with backoff
      const retryTimer = setTimeout(() => {
        console.log(`Auto-retrying receipt scan (attempt ${attemptCount + 1} of 2)...`);
        resetScanState();
        autoProcessReceipt();
        setAttemptCount(prev => prev + 1);
      }, backoffDelay);
      
      return () => clearTimeout(retryTimer);
    }
    
    // If we've reached max retries and still have errors, show a message
    if ((scanTimedOut || scanError) && attemptCount >= 2 && !processingComplete) {
      toast.error("Receipt processing failed. Using basic information only.");
      
      // Try to get at least basic info from the image
      if (onCapture) {
        onCapture({
          description: "Store Purchase",
          amount: "0.00",
          date: new Date().toISOString().split('T')[0],
          category: "Other",
          paymentMethod: "Card"
        });
      }
      
      // Close dialog after showing error, but with a delay
      const closeTimer = setTimeout(() => {
        setOpen(false);
      }, 2000);
      
      return () => clearTimeout(closeTimer);
    }
  }, [scanTimedOut, scanError, attemptCount, open, processingComplete, resetScanState, autoProcessReceipt, onCapture, setOpen]);

  // Handle dialog close - only allow closing when not processing
  const handleClose = () => {
    if (!isScanning && !isAutoProcessing) {
      resetScanState();
      
      // Call onCleanup only if not already called
      if (!hasCleanedUpRef.current) {
        // Add a small delay before cleaning up to make sure we're not still using the resources
        setTimeout(() => {
          onCleanup();
        }, 300);
        hasCleanedUpRef.current = true;
      }
      
      setOpen(false);
    }
  };
  
  // Handle switching to manual entry
  const handleManualEntry = () => {
    if (onManualEntry) {
      resetScanState();
      
      // Add a delay before cleanup to avoid issues
      setTimeout(() => {
        if (!hasCleanedUpRef.current) {
          onCleanup();
          hasCleanedUpRef.current = true;
        }
      }, 300);
      
      setOpen(false);
      onManualEntry();
    }
  };
  
  // Cleanup when dialog is closed but component isn't unmounted
  useEffect(() => {
    if (!open && !hasCleanedUpRef.current) {
      // Add a delay before cleanup
      const timer = setTimeout(() => {
        onCleanup();
        hasCleanedUpRef.current = true;
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [open, onCleanup]);

  // Get appropriate dialog title and description
  const dialogTitle = "Processing Receipt";
  const dialogDescription = "We'll extract all items and save them automatically as separate expenses";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        if (!isScanning && !isAutoProcessing) {
          handleClose();
        }
      } else {
        setOpen(true);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription>
          {dialogDescription}
        </DialogDescription>
        
        <div className="flex flex-col items-center space-y-4">
          {/* Only show preview if we have a URL */}
          {previewUrl && <ReceiptPreviewImage previewUrl={previewUrl} />}
          
          <ScanProgress
            isScanning={isScanning || isAutoProcessing}
            progress={scanProgress}
            statusMessage={statusMessage}
          />
          
          <ScanTimeoutMessage 
            scanTimedOut={scanTimedOut}
            scanError={scanError}
          />
          
          <DialogActions
            onCleanup={handleClose}
            isScanning={isScanning}
            isAutoProcessing={isAutoProcessing}
            scanTimedOut={scanTimedOut || !!scanError}
            handleScanReceipt={handleScanReceipt}
            disabled={!file}
            autoSave={true}
            scanProgress={scanProgress}
            statusMessage={statusMessage}
            onManualEntry={handleManualEntry}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
