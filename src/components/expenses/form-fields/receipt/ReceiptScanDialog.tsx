import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useScanReceipt } from "./hooks/useScanReceipt";
import { useEffect, useRef, useState } from "react";
import { useReceiptRetry } from "./hooks/useReceiptRetry";
import { useDialogCleanup } from "./hooks/useDialogCleanup";
import { ScanDialogContent } from "./components/ScanDialogContent";
import { ScanProgressBar } from "./components/ScanProgressBar";
import { useProgressAnimation } from "./hooks/useProgressAnimation";

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
      console.log(`🎯 Receipt Dialog: NEW FILE - Fingerprint: ${fingerprintRef.current}`);
      console.log(`📁 File Details:`, {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });
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

  // Use the progress animation hook for smooth progress display
  const displayedProgress = useProgressAnimation({
    isScanning: isScanning || isAutoProcessing,
    backendProgress: scanProgress
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

  // SIMPLIFIED AUTO-START: When dialog opens with a file, immediately start processing
  useEffect(() => {
    console.log(`🚀 Auto-process check:`, {
      open,
      hasFile: !!file,
      fileName: file?.name,
      isScanning,
      isAutoProcessing,
      autoProcess,
      autoProcessStarted,
      scanError: !!scanError,
      scanTimedOut,
      processingComplete
    });

    // Start processing if:
    // 1. Dialog is open
    // 2. We have a file
    // 3. Auto-process is enabled
    // 4. We haven't started yet
    // 5. Not currently processing
    // 6. No errors or timeouts
    if (
      open &&
      file &&
      autoProcess &&
      !autoProcessStarted &&
      !isScanning &&
      !isAutoProcessing &&
      !scanError &&
      !scanTimedOut &&
      !processingComplete
    ) {
      console.log(`🎬 STARTING AUTO-PROCESS for file: ${file.name}`);
      setAutoProcessStarted(true);

      // Start processing with a short delay to ensure UI is ready
      const timer = setTimeout(() => {
        console.log(`⚡ Triggering handleScanReceipt for: ${file.name}`);
        handleScanReceipt();
      }, 500);

      return () => {
        console.log(`🛑 Clearing auto-process timer`);
        clearTimeout(timer);
      };
    }
  }, [
    open,
    file,
    autoProcess,
    autoProcessStarted,
    isScanning,
    isAutoProcessing,
    scanError,
    scanTimedOut,
    processingComplete,
    handleScanReceipt
  ]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      console.log("🔄 Dialog closed - resetting all state");
      setAutoProcessStarted(false);
      retryHandler.setAttemptCount(0);
      retryHandler.setProcessing(false);
      resetScanState();
    }
  }, [open, retryHandler, resetScanState]);

  // Close dialog after processing completes successfully
  useEffect(() => {
    if (processingComplete && open && !isScanning && !isAutoProcessing) {
      console.log("✅ Processing complete - closing dialog in 2 seconds");
      
      if (onSuccess) {
        console.log("🎉 Calling onSuccess callback");
        onSuccess();
      }
      
      const timer = setTimeout(() => {
        console.log("🚪 Auto-closing dialog");
        setOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [processingComplete, open, isScanning, isAutoProcessing, setOpen, onSuccess]);

  const handleDialogClose = (isOpen: boolean) => {
    console.log(`🚪 Dialog close requested: ${isOpen}`);
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
          onCleanup={() => {
            if (handleClose(isScanning, isAutoProcessing)) {
              setOpen(false);
            }
          }}
          fileExists={!!file}
          processingComplete={processingComplete}
          autoProcess={autoProcess}
        >
          <ScanProgressBar 
            isScanning={isScanning || isAutoProcessing} 
            processingComplete={processingComplete}
            progress={displayedProgress}
          />
        </ScanDialogContent>
      </DialogContent>
    </Dialog>
  );
}
