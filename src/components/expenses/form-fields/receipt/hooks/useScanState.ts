
import { useState } from 'react';

export function useScanState() {
  // Track scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanTimedOut, setScanTimedOut] = useState(false);

  // Helper functions to manage scan state
  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanTimedOut(false);
  };

  const endScan = () => {
    setIsScanning(false);
  };

  const updateProgress = (progress: number, message?: string) => {
    setScanProgress(progress);
    if (message) {
      console.log(`Scan progress (${progress}%): ${message}`);
    }
  };

  const timeoutScan = () => {
    setScanTimedOut(true);
  };

  return {
    isScanning,
    scanProgress,
    scanTimedOut,
    startScan,
    endScan,
    updateProgress,
    timeoutScan
  };
}
