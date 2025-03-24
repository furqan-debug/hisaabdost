
import { Button } from "@/components/ui/button";
import { ScanButton } from "./ScanButton";

interface DialogActionsProps {
  onCleanup: () => void;
  isScanning: boolean;
  scanTimedOut: boolean;
  handleScanReceipt: () => void;
  disabled: boolean;
  autoSave?: boolean;
  isAutoProcessing?: boolean;
  scanProgress?: number;
  statusMessage?: string;
}

export function DialogActions({
  onCleanup,
  isScanning,
  scanTimedOut,
  handleScanReceipt,
  disabled,
  autoSave = false,
  isAutoProcessing = false,
  scanProgress = 0,
  statusMessage
}: DialogActionsProps) {
  return (
    <div className="flex w-full gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCleanup}
        disabled={isScanning || isAutoProcessing}
        className="flex-1"
      >
        Cancel
      </Button>
      
      <ScanButton
        isScanning={isScanning}
        scanTimedOut={scanTimedOut}
        onClick={handleScanReceipt}
        disabled={disabled}
        autoSave={autoSave}
        isAutoProcessing={isAutoProcessing}
        scanProgress={scanProgress}
        statusMessage={statusMessage}
      />
    </div>
  );
}
