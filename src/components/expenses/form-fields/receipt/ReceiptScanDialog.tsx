
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useScanReceipt } from "./hooks/useScanReceipt";
import { ScanProgress } from "./components/ScanProgress";
import { ScanTimeoutMessage } from "./components/ScanTimeoutMessage";
import { ReceiptPreviewImage } from "./components/ReceiptPreviewImage";
import { DialogActions } from "./components/DialogActions";
import { useEffect } from "react";

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
    autoProcessReceipt
  } = useScanReceipt({
    file,
    onCleanup,
    onCapture,
    autoSave,
    setOpen
  });
  
  // Automatically start processing when dialog opens with a file
  useEffect(() => {
    if (open && file && autoProcess && !isScanning && !isAutoProcessing && !scanTimedOut && !scanError) {
      autoProcessReceipt();
    }
  }, [open, file, autoProcess, isScanning, isAutoProcessing, scanTimedOut, scanError, autoProcessReceipt]);

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) onCleanup();
      setOpen(open);
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
            onCleanup={onCleanup}
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
