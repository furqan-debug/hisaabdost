
import { ReceiptField } from "../form-fields/ReceiptField";

interface ReceiptSectionProps {
  receiptUrl: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ReceiptSection({ 
  receiptUrl, 
  onFileChange
}: ReceiptSectionProps) {
  return (
    <div>
      <h3 className="text-base font-medium mb-2">Receipt</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Upload a receipt image for your records
      </p>
      <ReceiptField 
        receiptUrl={receiptUrl} 
        onFileChange={onFileChange} 
      />
    </div>
  );
}
