
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ScanLine } from "lucide-react";

interface ScanButtonProps {
  isScanning: boolean;
  scanTimedOut: boolean;
  onClick: () => void;
  disabled: boolean;
  autoSave?: boolean;
}

export function ScanButton({ 
  isScanning, 
  scanTimedOut, 
  onClick, 
  disabled, 
  autoSave = false 
}: ScanButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={isScanning || disabled}
    >
      {isScanning ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Scanning...
        </>
      ) : scanTimedOut ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </>
      ) : (
        <>
          <ScanLine className="mr-2 h-4 w-4" />
          {autoSave ? "Extract & Save" : "Extract Data"}
        </>
      )}
    </Button>
  );
}
