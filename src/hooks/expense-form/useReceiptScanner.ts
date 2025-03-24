
import { ExpenseFormData } from "./types";

interface UseReceiptScannerProps {
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptScanner({ updateField }: UseReceiptScannerProps) {
  // Placeholder function that doesn't do anything since scanning functionality has been removed
  const handleScanComplete = () => {
    // This function is kept as a placeholder to maintain interface compatibility
    console.log("Receipt scanning functionality has been removed");
  };

  return { handleScanComplete };
}
