
import { Button } from "@/components/ui/button";
import { ScanLine, Loader2 } from "lucide-react";

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
      variant="default"
      onClick={onClick}
      disabled={disabled || isScanning}
      className="flex-1"
    >
      {isScanning ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Scanning...
        </>
      ) : (
        <>
          <ScanLine className="mr-2 h-4 w-4" />
          {scanTimedOut ? "Retry Scan" : `Scan Receipt${autoSave ? " & Save" : ""}`}
        </>
      )}
    </Button>
  );
}
