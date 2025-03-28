
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useScanReceipt } from "./hooks/useScanReceipt";
import { ScanProgress } from "./components/ScanProgress";
import { ScanTimeoutMessage } from "./components/ScanTimeoutMessage";
import { ReceiptPreviewImage } from "./components/ReceiptPreviewImage";
import { DialogActions } from "./components/DialogActions";
import { useEffect, useState, useRef } from "react";
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
  const [hasCleanedUp, setHasCleanedUp] = useState(false);
  const [autoProcessStarted, setAutoProcessStarted] = useState(false);
  const fileRef = useRef<File | null>(null);
  const processingRef = useRef(false);
  
  // Store the file in ref to avoid dependency changes
  useEffect(() => {
    if (file && file !== fileRef.current) {
      fileRef.current = file;
    }
  }, [file]);
  
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
    file: fileRef.current,
    onCleanup: () => {
      // Mark as cleaned up
      setHasCleanedUp(true);
    },
    onCapture,
    autoSave,
    setOpen,
    onSuccess: () => {
      setProcessingComplete(true);
      processingRef.current = false;
    }
  });
  
  // Auto-process the receipt when the dialog opens - only once per file
  useEffect(() => {
    // Only run if component is mounted and dialog is open
    if (!open) return;

    // Only process if:
    // 1. Dialog is open
    // 2. We have a file
    // 3. We're not already scanning or processing
    // 4. Auto-process is enabled
    // 5. We haven't started auto-processing already
    // 6. No processing is currently in progress
    if (fileRef.current && 
        !isScanning && 
        !isAutoProcessing && 
        autoProcess && 
        !autoProcessStarted &&
        !processingRef.current) {
      
      console.log("Auto-processing receipt...");
      setAutoProcessStarted(true);
      processingRef.current = true;
      
      // Start processing after a small delay to allow UI to render
      const timer = setTimeout(() => {
        autoProcessReceipt();
        setAttemptCount(1); // Start at 1 for the first attempt
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open, isScanning, isAutoProcessing, autoProcessReceipt, autoProcess, autoProcessStarted]);
  
  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      setAutoProcessStarted(false);
      setProcessingComplete(false);
      setAttemptCount(0);
      setHasCleanedUp(false);
      processingRef.current = false;
    }
  }, [open]);

  // Retry logic for failed scans with exponential backoff
  // Limit to 1 retry (2 total attempts) and add more delay between retries
  useEffect(() => {
    // Only retry if:
    // 1. We have an error or timeout
    // 2. We're on the first attempt
    // 3. Dialog is open
    // 4. The first process hasn't completed
    // 5. No processing is currently in progress
    if ((scanTimedOut || scanError) && 
        attemptCount === 1 && 
        open && 
        !processingComplete && 
        !processingRef.current) {
      
      console.log(`Retry logic triggered. Attempt count: ${attemptCount}, Max: 1 retry`);
      processingRef.current = true; // Mark as processing
      
      // Use a longer backoff delay (3 seconds)
      const backoffDelay = 3000;
      
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
      processingRef.current = false; // Mark as not processing
      
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
      if (!hasCleanedUp) {
        // Add a small delay before cleaning up to make sure we're not still using the resources
        setTimeout(() => {
          onCleanup();
        }, 300);
        setHasCleanedUp(true);
      }
      
      processingRef.current = false;
      setOpen(false);
    }
  };
  
  // Handle switching to manual entry
  const handleManualEntry = () => {
    if (onManualEntry) {
      resetScanState();
      
      // Add a delay before cleanup to avoid issues
      setTimeout(() => {
        if (!hasCleanedUp) {
          onCleanup();
          setHasCleanedUp(true);
        }
      }, 300);
      
      processingRef.current = false;
      setOpen(false);
      onManualEntry();
    }
  };
  
  // Cleanup when dialog is closed but component isn't unmounted
  useEffect(() => {
    if (!open && !hasCleanedUp) {
      // Add a delay before cleanup
      const timer = setTimeout(() => {
        onCleanup();
        setHasCleanedUp(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [open, onCleanup, hasCleanedUp]);

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
            disabled={!fileRef.current}
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
