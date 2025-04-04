
import { Button } from "@/components/ui/button";
import { 
  Loader2, ReceiptText, Download, 
  CheckCircle, XCircle, RefreshCw 
} from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DialogActionsProps {
  onCleanup: () => void;
  isScanning: boolean;
  isAutoProcessing: boolean;
  scanTimedOut: boolean;
  handleScanReceipt: () => void;
  disabled?: boolean;
  autoSave?: boolean;
  scanProgress?: number;
  statusMessage?: string;
  autoProcess?: boolean;
  processingComplete?: boolean;
}

export function DialogActions({
  onCleanup,
  isScanning,
  isAutoProcessing,
  scanTimedOut,
  handleScanReceipt,
  disabled = false,
  autoSave = false,
  scanProgress = 0,
  statusMessage,
  autoProcess = true,
  processingComplete = false
}: DialogActionsProps) {
  // Determine if we should show the retry button
  const showRetry = (scanTimedOut || scanProgress === 100 || processingComplete) && autoProcess;
  
  // Determine if scanning is in progress
  const scanning = isScanning || isAutoProcessing;
  
  return (
    <DialogFooter className="flex sm:justify-between items-center gap-2">
      <div className="text-sm text-muted-foreground">
        {scanning && (
          <div className="flex items-center">
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            <span className="text-xs">
              {scanProgress < 100 
                ? `${Math.round(scanProgress)}% complete` 
                : "Finalizing..."}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 justify-end">
        {!scanning && !processingComplete && (
          <Button 
            variant="outline" 
            size="sm"
            type="button" 
            onClick={onCleanup}
          >
            Cancel
          </Button>
        )}
        
        {processingComplete ? (
          <Button 
            size="sm"
            type="button" 
            onClick={onCleanup}
            className="gap-2"
            variant="default"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Done</span>
          </Button>
        ) : showRetry ? (
          <Button 
            variant="outline" 
            size="sm"
            type="button" 
            onClick={handleScanReceipt}
            disabled={scanning || disabled}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry Scan</span>
          </Button>
        ) : !scanning && autoProcess ? (
          <Button
            type="button"
            onClick={handleScanReceipt}
            disabled={scanning || disabled}
            className="gap-2"
            size="sm"
          >
            <ReceiptText className="h-4 w-4" />
            <span>Scan Receipt</span>
          </Button>
        ) : null}
      </div>
    </DialogFooter>
  );
}
