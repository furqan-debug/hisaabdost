
import { Button } from "@/components/ui/button";
import { ScanLine, Loader2, RefreshCw } from "lucide-react";

interface ScanButtonProps {
  isScanning: boolean;
  scanTimedOut: boolean;
  onClick: () => void;
  disabled: boolean;
  autoSave?: boolean;
  isAutoProcessing?: boolean;
  scanProgress?: number;
  statusMessage?: string;
}

export function ScanButton({
  isScanning,
  scanTimedOut,
  onClick,
  disabled,
  autoSave = false,
  isAutoProcessing = false,
  scanProgress = 0,
  statusMessage
}: ScanButtonProps) {
  const buttonText = () => {
    if (isScanning) return "Processing...";
    if (isAutoProcessing) return "Auto-Processing...";
    if (scanTimedOut) return "Retry Scan";
    return `Process Receipt${autoSave ? " & Save" : ""}`;
  };

  // Format progress to whole number
  const formattedProgress = Math.round(scanProgress);

  // Determine button variant based on state
  const variant = scanTimedOut ? "destructive" : "default";

  return (
    <Button
      type="button"
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className="flex-1"
    >
      {(isScanning || isAutoProcessing) ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {buttonText()}
          {scanProgress > 0 && (
            <span className="ml-1 text-xs">({formattedProgress}%)</span>
          )}
        </>
      ) : scanTimedOut ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          {buttonText()}
        </>
      ) : (
        <>
          <ScanLine className="mr-2 h-4 w-4" />
          {buttonText()}
        </>
      )}
    </Button>
  );
}
