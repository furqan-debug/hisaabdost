
import { AlertTriangle, RefreshCw, FileWarning, FileX } from "lucide-react";
import { useState, useEffect } from "react";

interface ScanTimeoutMessageProps {
  scanTimedOut: boolean;
  scanError?: string;
}

export function ScanTimeoutMessage({ scanTimedOut, scanError }: ScanTimeoutMessageProps) {
  const [errorMessage, setErrorMessage] = useState<string | undefined>(scanError);
  
  // Handle file access errors
  useEffect(() => {
    if (!scanError) {
      setErrorMessage(undefined);
      return;
    }

    // Check for specific error patterns
    if (scanError.includes("ERR_FILE_NOT_FOUND") || scanError.includes("blob:")) {
      setErrorMessage("The receipt image file could not be accessed. It may have been removed or expired.");
    } else if (scanError.includes("Failed to fetch")) {
      setErrorMessage("Network error: Could not connect to the receipt processing service.");
    } else {
      setErrorMessage(scanError);
    }
  }, [scanError]);
  
  if (!scanTimedOut && !errorMessage) return null;
  
  // Check if error is related to file access
  const isFileAccessError = errorMessage && (
    errorMessage.includes("ERR_FILE_NOT_FOUND") || 
    errorMessage.includes("blob:") || 
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("access") ||
    errorMessage.includes("file") ||
    errorMessage.includes("permission")
  );
  
  // Check if error is related to network
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
          <p>The scan timed out. Try taking a clearer photo, using a smaller image file, or click "Retry Scan".</p>
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
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <div>
            <p>Network error: Could not connect to the receipt processing service.</p>
            <p className="mt-1 text-xs">Check your internet connection and try again.</p>
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
