
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertCircle, Check, X, Pencil } from "lucide-react";

interface DialogActionsProps {
  onCleanup: () => void;
  isScanning: boolean;
  isAutoProcessing: boolean;
  scanTimedOut: boolean;
  handleScanReceipt: () => void;
  disabled: boolean;
  autoSave?: boolean;
  scanProgress?: number;
  statusMessage?: string;
  onManualEntry?: () => void;
}

export function DialogActions({
  onCleanup,
  isScanning,
  isAutoProcessing,
  scanTimedOut,
  handleScanReceipt,
  disabled,
  autoSave = false,
  scanProgress = 0,
  statusMessage,
  onManualEntry
}: DialogActionsProps) {
  const isComplete = scanProgress === 100 && !isScanning && !isAutoProcessing && !scanTimedOut;
  
  if (isScanning || isAutoProcessing) {
    return (
      <div className="flex justify-end w-full">
        {/* Show cancel button only when automatic processing is happening */}
        {isAutoProcessing && (
          <Button 
            type="button" 
            variant="outline"
            onClick={onCleanup}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>
    );
  }
  
  if (isComplete) {
    return (
      <div className="flex justify-end w-full">
        <Button
          type="button"
          variant="default"
          onClick={onCleanup}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" />
          {autoSave ? "Expenses Saved" : "Complete"}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-2 w-full">
      {scanTimedOut ? (
        <>
          <Button
            type="button"
            variant="default"
            onClick={handleScanReceipt}
            disabled={disabled}
            className="flex-1"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry Scan
          </Button>
          
          {onManualEntry && (
            <Button
              type="button"
              variant="outline"
              onClick={onManualEntry}
              className="flex-1"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Switch to Manual Entry
            </Button>
          )}
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="default"
            onClick={handleScanReceipt}
            disabled={disabled || isScanning}
            className="flex-1"
          >
            {statusMessage ? statusMessage : "Scan Receipt"}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onCleanup}
            className="flex-shrink-0"
          >
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </>
      )}
    </div>
  );
}
