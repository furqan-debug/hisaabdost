
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ScanButton } from "./ScanButton";

interface DialogActionsProps {
  onCleanup: () => void;
  isScanning: boolean;
  scanTimedOut: boolean;
  handleScanReceipt: () => void;
  disabled: boolean;
  autoSave?: boolean;
}

export function DialogActions({
  onCleanup,
  isScanning,
  scanTimedOut,
  handleScanReceipt,
  disabled,
  autoSave = false
}: DialogActionsProps) {
  return (
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
        disabled={disabled}
        autoSave={autoSave}
      />
    </DialogFooter>
  );
}
