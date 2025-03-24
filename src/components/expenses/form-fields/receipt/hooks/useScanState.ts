
import { useState } from 'react';

export function useScanState() {
  // Track scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanTimedOut, setScanTimedOut] = useState(false);

  return {
    isScanning,
    setIsScanning,
    scanProgress,
    setScanProgress,
    scanTimedOut,
    setScanTimedOut
  };
}
