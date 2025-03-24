
import { Button } from "@/components/ui/button";
import { ScanLine, Loader2 } from "lucide-react";

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
    if (scanTimedOut) return "Retry";
    return `Process Receipt${autoSave ? " & Save" : ""}`;
  };

  return (
    <Button
      type="button"
      variant="default"
      onClick={onClick}
      disabled={disabled || isScanning || isAutoProcessing}
      className="flex-1"
    >
      {(isScanning || isAutoProcessing) ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {buttonText()}
          {scanProgress > 0 && scanProgress < 100 && (
            <span className="ml-1 text-xs">({scanProgress}%)</span>
          )}
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
