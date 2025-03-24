
import { useScanProcess } from "./useScanProcess";
import { useScanResults } from "./useScanResults";
import { useScanState } from "./useScanState";

interface UseScanReceiptProps {
  file: File | null;
  onCleanup: () => void;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  autoSave?: boolean;
  setOpen: (open: boolean) => void;
}

export function useScanReceipt({
  file,
  onCleanup,
  onCapture,
  autoSave = false,
  setOpen
}: UseScanReceiptProps) {
  // Use the separated scan state hook
  const { 
    isScanning, 
    setIsScanning, 
    scanProgress, 
    setScanProgress, 
    scanTimedOut, 
    setScanTimedOut 
  } = useScanState();

  // Use the scan process management hook
  const { handleScanReceipt } = useScanProcess({
    file,
    isScanning,
    setIsScanning,
    setScanProgress,
    setScanTimedOut
  });

  // Use the scan results processing hook
  useScanResults({
    isScanning,
    scanTimedOut,
    autoSave,
    onCapture,
    setOpen,
    onCleanup
  });

  return {
    isScanning,
    scanProgress,
    scanTimedOut,
    handleScanReceipt
  };
}
