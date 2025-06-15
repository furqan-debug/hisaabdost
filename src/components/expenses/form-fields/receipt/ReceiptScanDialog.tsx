
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useScanReceipt } from "./hooks/useScanReceipt";
import { useEffect, useRef, useState } from "react";
import { useReceiptRetry } from "./hooks/useReceiptRetry";
import { useDialogCleanup } from "./hooks/useDialogCleanup";
import { ScanDialogContent } from "./components/ScanDialogContent";
import { ScanProgressBar } from "./components/ScanProgressBar";

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
  onSuccess?: () => void;
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
  onSuccess
}: ReceiptScanDialogProps) {
  const [autoProcessStarted, setAutoProcessStarted] = useState(false);
  const fingerprintRef = useRef<string | null>(null);

  // Generate a fingerprint to avoid re-processing the same file
  useEffect(() => {
    if (file) {
      fingerprintRef.current = `${file.name}-${file.size}-${file.lastModified}`;
      console.log(`Receipt Dialog: Fingerprint created: ${fingerprintRef.current}`);
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
    processingComplete,
    autoProcessReceipt,
    resetScanState
  } = useScanReceipt({
    file, 
    onCleanup,
    onCapture,
    autoSave,
    setOpen,
    onSuccess,
    processAllItems: true
  });

  const retryHandler = useReceiptRetry({
    scanTimedOut,
    scanError,
    isScanning,
    isAutoProcessing,
    processingComplete,
    resetScanState,
    autoProcessReceipt,
    onCapture,
    setOpen
  });

  const { handleClose } = useDialogCleanup({ open, onCleanup });

  // Auto-start receipt scanning when dialog opens and file is ready
  useEffect(() => {
    if (
      open &&
      file &&
      !isScanning &&
      !isAutoProcessing &&
      autoProcess &&
      !autoProcessStarted &&
      !retryHandler.isProcessingInProgress()
    ) {
      console.log(`Receipt Dialog: Auto-processing triggered for: ${fingerprintRef.current}`);
      console.log(`Receipt Dialog: File details - Name: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
      setAutoProcessStarted(true);

      // Start processing immediately when dialog opens
      const timer = setTimeout(() => {
        console.log("Receipt Dialog: Starting automatic receipt scan...");
        handleScanReceipt();
      }, 1000); // Increased delay to ensure everything is ready

      return () => clearTimeout(timer);
    }
  }, [
    open,
    file,
    isScanning,
    isAutoProcessing,
    autoProcess,
    autoProcessStarted,
    handleScanReceipt,
    retryHandler
  ]);

  // Reset scan state when dialog closes
  useEffect(() => {
    if (!open) {
      console.log("Receipt Dialog: Dialog closed, resetting state");
      setAutoProcessStarted(false);
      retryHandler.setAttemptCount(0);
      retryHandler.setProcessing(false);
    }
  }, [open, retryHandler]);

  // Close dialog after processing completes
  useEffect(() => {
    if (processingComplete && open && !isScanning && !isAutoProcessing) {
      console.log("Receipt Dialog: Processing complete, closing dialog");
      
      // Trigger the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close the dialog with a slight delay
      const timer = setTimeout(() => {
        setOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [processingComplete, open, isScanning, isAutoProcessing, setOpen, onSuccess]);

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen && handleClose(isScanning, isAutoProcessing)) {
      retryHandler.setProcessing(false);
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <ScanDialogContent
          previewUrl={previewUrl}
          isScanning={isScanning}
          isAutoProcessing={isAutoProcessing}
          scanProgress={scanProgress}
          statusMessage={statusMessage}
          scanTimedOut={scanTimedOut}
          scanError={!!scanError}
          handleScanReceipt={handleScanReceipt}
          onCleanup={() => handleClose(isScanning, isAutoProcessing)}
          fileExists={!!file}
          processingComplete={processingComplete}
          autoProcess={autoProcess}
        >
          <ScanProgressBar 
            isScanning={isScanning || isAutoProcessing} 
            processingComplete={processingComplete}
          />
        </ScanDialogContent>
      </DialogContent>
    </Dialog>
  );
}
