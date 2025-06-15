
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
  autoSave = true, // Default to true for automatic saving
  autoProcess = true, // Default to true for automatic processing
  onSuccess
}: ReceiptScanDialogProps) {
  const [autoProcessStarted, setAutoProcessStarted] = useState(false);
  const fingerprintRef = useRef<string | null>(null);

  // Generate a fingerprint to avoid re-processing the same file
  useEffect(() => {
    if (file) {
      fingerprintRef.current = `${file.name}-${file.size}-${file.lastModified}`;
      console.log(`Fingerprint created: ${fingerprintRef.current}`);
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
    processAllItems: true // Always process all items from the receipt
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
      console.log(`Auto-processing triggered for: ${fingerprintRef.current}`);
      setAutoProcessStarted(true);

      // Start processing immediately when dialog opens
      const timer = setTimeout(() => {
        console.log("Starting automatic receipt scan...");
        handleScanReceipt(); // Trigger the scan directly
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    open,
    file,
    isScanning,
    isAutoProcessing,
    autoProcess,
    autoProcessStarted,
    handleScanReceipt
  ]);

  // Reset scan state when dialog closes
  useEffect(() => {
    if (!open) {
      setAutoProcessStarted(false);
      retryHandler.setAttemptCount(0);
      retryHandler.setProcessing(false);
    }
  }, [open, retryHandler]);

  // Close dialog after processing completes
  useEffect(() => {
    if (processingComplete && open && !isScanning && !isAutoProcessing) {
      // Trigger the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close the dialog with a slight delay
      const timer = setTimeout(() => {
        setOpen(false);
      }, 1500);
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
