
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useScanReceipt } from "./hooks/useScanReceipt";
import { ScanProgress } from "./components/ScanProgress";
import { ScanTimeoutMessage } from "./components/ScanTimeoutMessage";
import { ScanButton } from "./components/ScanButton";

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
          {previewUrl && (
            <div className="relative w-full max-h-64 overflow-hidden rounded-md border">
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="w-full object-contain"
              />
            </div>
          )}
          
          <ScanProgress
            isScanning={isScanning}
            progress={scanProgress}
          />
          
          <ScanTimeoutMessage scanTimedOut={scanTimedOut} />
          
          <DialogFooter className="w-full flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCleanup}
            >
              Cancel
            </Button>
            
            <ScanButton
              isScanning={isScanning}
              scanTimedOut={scanTimedOut}
              onClick={handleScanReceipt}
              disabled={!file}
              autoSave={autoSave}
            />
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
