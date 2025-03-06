
import { RefreshCw } from "lucide-react";

interface ScanTimeoutMessageProps {
  scanTimedOut: boolean;
}

export function ScanTimeoutMessage({ scanTimedOut }: ScanTimeoutMessageProps) {
  if (!scanTimedOut) return null;
  
  return (
    <div className="text-sm text-amber-500 flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md w-full">
      <RefreshCw className="h-4 w-4 shrink-0" />
      <p>The scan timed out. Try taking a clearer photo or using a smaller image file.</p>
    </div>
  );
}
