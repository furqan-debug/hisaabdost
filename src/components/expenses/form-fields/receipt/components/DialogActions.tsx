
import { Button } from "@/components/ui/button";
import { CircleHelp, Scan, RefreshCw, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogActionsProps {
  onCleanup: () => void;
  isScanning: boolean;
  isAutoProcessing: boolean;
  scanTimedOut: boolean;
  handleScanReceipt: () => void;
  disabled: boolean;
  autoSave: boolean;
  scanProgress: number;
  statusMessage?: string; // Make statusMessage optional with "?" here
  onManualEntry?: () => void;
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
  statusMessage = "", // Provide default empty string
  onManualEntry
}: DialogActionsProps) {
  // Check if statusMessage is defined before calling includes
  const showRetryScan = scanTimedOut || 
    (typeof statusMessage === 'string' && 
      (statusMessage.includes('error') || 
       statusMessage.toLowerCase().includes('failed')));

  return (
    <div className="flex flex-col w-full gap-2 mt-2">
      {showRetryScan && (
        <Button
          onClick={handleScanReceipt}
          disabled={disabled || isScanning || isAutoProcessing}
          variant="default"
          className="w-full bg-green-600 hover:bg-green-700 gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Scan
        </Button>
      )}
      
      <Button
        variant="outline"
        className={cn(
          "w-full gap-2 border-gray-300",
          showRetryScan ? "mt-2" : ""
        )}
        onClick={onManualEntry}
      >
        <FileText className="h-4 w-4" />
        Switch to Manual Entry
      </Button>
    </div>
  );
}
