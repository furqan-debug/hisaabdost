
import { useState, useCallback } from "react";

export function useScanState() {
  // State to track scanning process
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanTimedOut, setScanTimedOut] = useState(false);

  // Start scan function
  const startScan = useCallback(() => {
    setIsScanning(true);
    setScanProgress(0);
    setScanTimedOut(false);
  }, []);

  // End scan function
  const endScan = useCallback(() => {
    setIsScanning(false);
  }, []);

  // Update progress function
  const updateProgress = useCallback((progress: number, message?: string) => {
    setScanProgress(progress);
    if (message) {
      console.log(message);
    }
  }, []);

  // Timeout scan function
  const timeoutScan = useCallback(() => {
    setScanTimedOut(true);
    setIsScanning(false);
  }, []);

  return {
    isScanning,
    setIsScanning,
    scanProgress,
    setScanProgress,
    scanTimedOut,
    setScanTimedOut,
    startScan,
    endScan,
    updateProgress,
    timeoutScan
  };
}
