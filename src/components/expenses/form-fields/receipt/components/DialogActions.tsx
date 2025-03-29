
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DialogActionsProps {
  onCleanup: () => void;
  isScanning: boolean;
  isAutoProcessing: boolean;
  scanTimedOut: boolean;
  handleScanReceipt: () => void;
  disabled: boolean;
  autoSave: boolean;
  scanProgress: number;
  statusMessage?: string;
}

export function DialogActions({
  onCleanup,
  isScanning,
  isAutoProcessing,
  scanTimedOut,
  handleScanReceipt,
  disabled,
  autoSave,
  scanProgress,
  statusMessage = ""
}: DialogActionsProps) {
  // Safe check for statusMessage - ensure it's a string before using includes
  const hasError = typeof statusMessage === 'string' && (
    statusMessage.toLowerCase().includes('error') || 
    statusMessage.toLowerCase().includes('failed')
  );

  // Only show retry button if there's an error or timeout
  const showRetryScan = scanTimedOut || hasError;

  if (!showRetryScan) {
    return null;
  }

  return (
    <div className="flex flex-col w-full gap-2 mt-2">
      <Button
        onClick={handleScanReceipt}
        disabled={disabled || isScanning || isAutoProcessing}
        variant="default"
        className="w-full bg-green-600 hover:bg-green-700 gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Retry Scan
      </Button>
    </div>
  );
}
