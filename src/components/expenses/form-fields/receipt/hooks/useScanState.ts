
import { useState, useCallback } from "react";

export function useScanState() {
  // State to track scanning process
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanTimedOut, setScanTimedOut] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);

  // Start scan function
  const startScan = useCallback(() => {
    setIsScanning(true);
    setScanProgress(0);
    setScanTimedOut(false);
    setScanError(null);
    setStatusMessage(undefined);
  }, []);

  // End scan function
  const endScan = useCallback(() => {
    setIsScanning(false);
  }, []);

  // Update progress function
  const updateProgress = useCallback((progress: number, message?: string) => {
    setScanProgress(progress);
    if (message) {
      setStatusMessage(message);
    }
  }, []);

  // Timeout scan function
  const timeoutScan = useCallback(() => {
    setScanTimedOut(true);
    setIsScanning(false);
  }, []);

  // Error scan function
  const errorScan = useCallback((error: string) => {
    setScanError(error);
    setIsScanning(false);
  }, []);

  // Reset scan state function
  const resetState = useCallback(() => {
    setIsScanning(false);
    setScanProgress(0);
    setScanTimedOut(false);
    setScanError(null);
    setStatusMessage(undefined);
  }, []);

  return {
    isScanning,
    setIsScanning,
    scanProgress,
    setScanProgress,
    scanTimedOut,
    setScanTimedOut,
    scanError,
    setScanError,
    statusMessage,
    setStatusMessage,
    startScan,
    endScan,
    updateProgress,
    timeoutScan,
    errorScan,
    resetState
  };
}
