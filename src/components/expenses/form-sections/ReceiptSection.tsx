
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
    <div>
      <h3 className="text-base font-medium mb-2">Receipt</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Upload a receipt image to automatically extract items, prices, and date
      </p>
      <ReceiptField 
        receiptUrl={receiptUrl} 
        onFileChange={onFileChange} 
        onScanComplete={onScanComplete}
      />
    </div>
  );
}
