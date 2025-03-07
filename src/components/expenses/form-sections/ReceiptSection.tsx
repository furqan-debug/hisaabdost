
import { ScanResult } from "@/hooks/expense-form/types";
import { ReceiptField } from "../form-fields/ReceiptField";

interface ReceiptSectionProps {
  receiptUrl: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScanComplete: (expenseDetails: ScanResult) => void;
}

export function ReceiptSection({ 
  receiptUrl, 
  onFileChange, 
  onScanComplete 
}: ReceiptSectionProps) {
  return (
    <ReceiptField 
      receiptUrl={receiptUrl} 
      onFileChange={onFileChange} 
      onScanComplete={onScanComplete}
    />
  );
}
