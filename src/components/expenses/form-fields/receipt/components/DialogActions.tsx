
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
  onManualEntry?: () => void;
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
  statusMessage,
  onManualEntry
}: DialogActionsProps) {
  // The cancel button should be disabled during scanning or auto-processing
  const isCancelDisabled = isScanning || isAutoProcessing;
  
  // The scan button should only be disabled if no file or currently scanning/processing
  // For retry cases (scanTimedOut), we want to enable the button even if disabled=true
  const isScanDisabled = (disabled && !scanTimedOut) || isScanning || isAutoProcessing;
  
  return (
    <div className="flex flex-col w-full gap-3">
      {/* Show error message when scan failed with option to go to manual entry */}
      {(scanTimedOut || disabled) && onManualEntry && (
        <Button
          type="button"
          variant="outline"
          onClick={onManualEntry}
          className="w-full"
        >
          Switch to Manual Entry
        </Button>
      )}
      
      <div className="flex w-full gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCleanup}
          disabled={isCancelDisabled}
          className="flex-1"
        >
          Cancel
        </Button>
        
        <ScanButton
          isScanning={isScanning}
          scanTimedOut={scanTimedOut}
          onClick={handleScanReceipt}
          disabled={isScanDisabled}
          autoSave={autoSave}
          isAutoProcessing={isAutoProcessing}
          scanProgress={scanProgress}
          statusMessage={statusMessage}
        />
      </div>
    </div>
  );
}
