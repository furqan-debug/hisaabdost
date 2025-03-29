
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useScanReceipt } from "./hooks/useScanReceipt";
import { useEffect, useRef, useState } from "react";
import { useReceiptRetry } from "./hooks/useReceiptRetry";
import { useDialogCleanup } from "./hooks/useDialogCleanup";
import { ScanDialogContent } from "./components/ScanDialogContent";

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
}

export function ReceiptScanDialog({
  file,
  previewUrl,
  open,
  setOpen,
  onCleanup,
  onCapture,
  autoSave = true,
  autoProcess = true
}: ReceiptScanDialogProps) {
  const [processingComplete, setProcessingComplete] = useState(false);
  const [autoProcessStarted, setAutoProcessStarted] = useState(false);
  const fileRef = useRef<File | null>(null);
  const fileFingerprint = useRef<string | null>(null);
  
  // Store the file in ref to avoid dependency changes
  useEffect(() => {
    if (file && file !== fileRef.current) {
      fileRef.current = file;
      // Create a fingerprint to track if we've processed this file
      fileFingerprint.current = `${file.name}-${file.size}-${file.lastModified}`;
      console.log(`New file assigned to dialog: ${file.name} (fingerprint: ${fileFingerprint.current})`);
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
      // Nothing needed here as we're handling cleanup separately
    },
    onCapture,
    autoSave,
    setOpen,
    onSuccess: () => {
      setProcessingComplete(true);
      retryHandler.setProcessing(false);
    },
    processAllItems: true // Enable processing all items as separate expenses
  });

  // Use our custom hooks for retry logic and dialog cleanup
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
  
  const { handleClose } = useDialogCleanup({
    open,
    onCleanup
  });

  // Auto-process the receipt when the dialog opens - only once per file
  useEffect(() => {
    // Only run if component is mounted and dialog is open
    if (!open) return;

    // Only process if all these conditions are true:
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
        !retryHandler.isProcessing()) {
      
      console.log(`Auto-processing starting for: ${fileFingerprint.current}`);
      setAutoProcessStarted(true);
      
      // Start processing after a small delay to allow UI to render
      const timer = setTimeout(() => {
        retryHandler.startProcessing();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open, isScanning, isAutoProcessing, autoProcess, autoProcessStarted]);
  
  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      // Only reset state if it was previously open (to avoid unnecessary resets)
      setAutoProcessStarted(false);
      setProcessingComplete(false);
      retryHandler.setAttemptCount(0);
      retryHandler.setProcessing(false);
    }
  }, [open]);

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      if (handleClose(isScanning, isAutoProcessing)) {
        retryHandler.setProcessing(false);
        setOpen(false);
      }
    } else {
      setOpen(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <ScanDialogContent
          previewUrl={previewUrl}
          isScanning={isScanning}
          isAutoProcessing={isAutoProcessing}
          scanProgress={scanProgress}
          statusMessage={statusMessage}
          scanTimedOut={scanTimedOut}
          scanError={scanError}
          handleScanReceipt={handleScanReceipt}
          onCleanup={() => handleClose(isScanning, isAutoProcessing)}
          fileExists={!!fileRef.current}
        />
      </DialogContent>
    </Dialog>
  );
}
