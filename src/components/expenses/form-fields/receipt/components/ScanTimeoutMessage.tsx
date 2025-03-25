
import { AlertTriangle, RefreshCw, FileWarning } from "lucide-react";

interface ScanTimeoutMessageProps {
  scanTimedOut: boolean;
  scanError?: string;
}

export function ScanTimeoutMessage({ scanTimedOut, scanError }: ScanTimeoutMessageProps) {
  if (!scanTimedOut && !scanError) return null;
  
  return (
    <div className="text-sm text-amber-500 flex items-center gap-2 bg-amber-950/30 dark:bg-amber-950/30 p-3 rounded-md w-full">
      {scanTimedOut ? (
        <>
          <RefreshCw className="h-4 w-4 shrink-0" />
          <p>The scan timed out. Try taking a clearer photo, using a smaller image file, or switch to manual entry.</p>
        </>
      ) : scanError ? (
        <>
          <FileWarning className="h-4 w-4 shrink-0" />
          <p>{scanError}</p>
        </>
      ) : (
        <>
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>An error occurred while processing your receipt.</p>
        </>
      )}
    </div>
  );
}
