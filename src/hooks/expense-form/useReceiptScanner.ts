
import { ExpenseFormData } from "./types";

interface UseReceiptScannerProps {
  updateField: <K extends keyof ExpenseFormData>(field: K, value: ExpenseFormData[K]) => void;
}

export function useReceiptScanner({ updateField }: UseReceiptScannerProps) {
  // Simplified version with no scanning functionality
  const handleScanComplete = () => {
    // This function is kept as a placeholder to maintain interface compatibility
    // but has no functionality since scanning has been removed
  };

  return { handleScanComplete };
}
