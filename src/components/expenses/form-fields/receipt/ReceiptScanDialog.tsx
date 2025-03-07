
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { useScanReceipt } from "./hooks/useScanReceipt";
import { ScanProgress } from "./components/ScanProgress";
import { ScanTimeoutMessage } from "./components/ScanTimeoutMessage";
import { ScanButton } from "./components/ScanButton";
import { ReceiptPreviewImage } from "./components/ReceiptPreviewImage";
import { DialogActions } from "./components/DialogActions";

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
}

export function ReceiptScanDialog({
  file,
  previewUrl,
  open,
  setOpen,
  onCleanup,
  onCapture,
  autoSave = false
}: ReceiptScanDialogProps) {
  const {
    isScanning,
    scanProgress,
    scanTimedOut,
    handleScanReceipt
  } = useScanReceipt({
    file,
    onCleanup,
    onCapture,
    autoSave,
    setOpen
  });

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) onCleanup();
      setOpen(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Scan Receipt</DialogTitle>
        <DialogDescription>
          {autoSave 
            ? "We'll extract all items and save them automatically" 
            : "We'll extract the store name, amount, date and other details"}
        </DialogDescription>
        
        <div className="flex flex-col items-center space-y-4">
          <ReceiptPreviewImage previewUrl={previewUrl} />
          
          <ScanProgress
            isScanning={isScanning}
            progress={scanProgress}
          />
          
          <ScanTimeoutMessage scanTimedOut={scanTimedOut} />
          
          <DialogActions
            onCleanup={onCleanup}
            isScanning={isScanning}
            scanTimedOut={scanTimedOut}
            handleScanReceipt={handleScanReceipt}
            disabled={!file}
            autoSave={autoSave}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
