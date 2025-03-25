
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useScanReceipt } from "./hooks/useScanReceipt";
import { ScanProgress } from "./components/ScanProgress";
import { ScanTimeoutMessage } from "./components/ScanTimeoutMessage";
import { ReceiptPreviewImage } from "./components/ReceiptPreviewImage";
import { DialogActions } from "./components/DialogActions";
import { useEffect, useRef } from "react";

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
  autoSave = true, // Set default to true to always auto-save expenses
  autoProcess = true
}: ReceiptScanDialogProps) {
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
    autoSave,
    setOpen
  });
  
  const hasAutoProcessed = useRef(false);
  
  // Auto-process the receipt when the dialog opens
  useEffect(() => {
    if (open && file && autoProcess && !isScanning && !isAutoProcessing && !hasAutoProcessed.current) {
      hasAutoProcessed.current = true;
      
      const timer = setTimeout(() => {
        console.log("Auto-processing receipt...");
        autoProcessReceipt();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [open, file, autoProcess, isScanning, isAutoProcessing, autoProcessReceipt]);
  
  // Reset the auto-processed flag when the dialog is closed
  useEffect(() => {
    if (!open) {
      hasAutoProcessed.current = false;
    }
  }, [open]);

  const handleClose = () => {
    if (!isScanning && !isAutoProcessing) {
      resetScanState();
      onCleanup();
      setOpen(false);
    }
  };

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
        <DialogTitle>Processing Receipt</DialogTitle>
        <DialogDescription>
          {autoSave 
            ? "We'll extract all items and save them automatically as separate expenses" 
            : "We'll extract the store name, amount, date and other details"}
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
            autoSave={autoSave}
            scanProgress={scanProgress}
            statusMessage={statusMessage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
