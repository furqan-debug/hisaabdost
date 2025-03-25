
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
    onCleanup,
    onCapture,
    autoSave: true,
    setOpen,
    onSuccess: () => {
      setProcessingComplete(true);
    }
  });
  
  const hasAutoProcessed = useRef(false);
  
  // Auto-process the receipt when the dialog opens
  useEffect(() => {
    if (open && file && !isScanning && !isAutoProcessing && !hasAutoProcessed.current) {
      hasAutoProcessed.current = true;
      
      // Start processing immediately with a small delay to allow UI to render
      setTimeout(() => {
        console.log("Auto-processing receipt...");
        autoProcessReceipt();
        setAttemptCount(prev => prev + 1);
      }, 100);
    }
  }, [open, file, isScanning, isAutoProcessing, autoProcessReceipt]);
  
  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      hasAutoProcessed.current = false;
      setProcessingComplete(false);
      setAttemptCount(0);
    }
  }, [open]);

  // Retry logic for failed scans
  useEffect(() => {
    if ((scanTimedOut || scanError) && attemptCount < 2 && open && !processingComplete) {
      // Auto-retry once after short delay
      const retryTimer = setTimeout(() => {
        console.log("Auto-retrying receipt scan...");
        resetScanState();
        autoProcessReceipt();
        setAttemptCount(prev => prev + 1);
      }, 1500);
      
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
      
      // Close dialog after showing error
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
      onCleanup();
      setOpen(false);
    }
  };
  
  // Handle switching to manual entry
  const handleManualEntry = () => {
    if (onManualEntry) {
      resetScanState();
      onCleanup();
      setOpen(false);
      onManualEntry();
    }
  };
  
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
          <ReceiptPreviewImage previewUrl={previewUrl} />
          
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
