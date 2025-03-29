
import { AlertTriangle, RefreshCw, FileWarning, FileX, Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";

interface ScanTimeoutMessageProps {
  scanTimedOut: boolean;
  scanError?: string | null;
}

export function ScanTimeoutMessage({ scanTimedOut, scanError }: ScanTimeoutMessageProps) {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(scanError || undefined);
  
  // Handle errors and provide appropriate messages
  useEffect(() => {
    if (!scanError) {
      setErrorMessage(undefined);
      return;
    }

    // Check for specific error patterns
    if (scanError.includes("ERR_FILE_NOT_FOUND") || scanError.includes("blob:")) {
      setErrorMessage("The receipt image file could not be accessed. It may have been removed or expired.");
    } else if (scanError.includes("Failed to fetch") || scanError.includes("network")) {
      setErrorMessage("Network error: Could not connect to the receipt processing service. Using local processing instead.");
    } else if (scanError.includes("timeout")) {
      setErrorMessage("The receipt processing service took too long to respond. Using local processing instead.");
    } else {
      setErrorMessage(scanError);
    }
  }, [scanError]);
  
  if (!scanTimedOut && !errorMessage) return null;
  
  // Check error type
  const isFileAccessError = errorMessage && (
    errorMessage.includes("ERR_FILE_NOT_FOUND") || 
    errorMessage.includes("blob:") || 
    errorMessage.includes("file") ||
    errorMessage.includes("permission")
  );
  
  const isNetworkError = errorMessage && (
    errorMessage.includes("network") ||
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout")
  );
  
  return (
    <div className="text-sm text-amber-500 flex items-center gap-2 bg-amber-950/30 dark:bg-amber-950/30 p-3 rounded-md w-full">
      {scanTimedOut ? (
        <>
          <RefreshCw className="h-4 w-4 shrink-0" />
          <div>
            <p>The scan timed out. Processing locally instead.</p>
            <p className="mt-1 text-xs">If necessary, click "Retry Scan" for better results.</p>
          </div>
        </>
      ) : isFileAccessError ? (
        <>
          <FileX className="h-4 w-4 shrink-0" />
          <div>
            <p>The receipt image file could not be accessed.</p>
            <p className="mt-1 text-xs">Try uploading the receipt again or click "Retry Scan".</p>
          </div>
        </>
      ) : isNetworkError ? (
        <>
          <WifiOff className="h-4 w-4 shrink-0" />
          <div>
            <p>Network error: Using local processing instead.</p>
            <p className="mt-1 text-xs">Check your internet connection to use cloud-based receipt processing.</p>
          </div>
        </>
      ) : errorMessage ? (
        <>
          <FileWarning className="h-4 w-4 shrink-0" />
          <div>
            <p>{errorMessage}</p>
            <p className="mt-1 text-xs">Click "Retry Scan" to attempt processing again.</p>
          </div>
        </>
      ) : (
        <>
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>An error occurred while processing your receipt. Please try again.</p>
        </>
      )}
    </div>
  );
}
