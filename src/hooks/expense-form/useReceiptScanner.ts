
import { ExpenseFormData } from "./types";

interface UseReceiptScannerProps {
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptScanner({ updateField }: UseReceiptScannerProps) {
  // Empty implementation since we've removed the scanning functionality
  const handleScanComplete = () => {
    console.log("Receipt scanning functionality has been removed");
    // No-op function to maintain API compatibility
  };

  return { handleScanComplete };
}
