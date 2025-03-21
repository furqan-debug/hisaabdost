
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ReceiptPreview } from "./receipt/ReceiptPreview";
import { ReceiptActions } from "./receipt/ReceiptActions";
import { useReceiptScanner } from "./receipt/ReceiptScanner";
import { ReceiptScanResult, ScanResult } from "@/hooks/expense-form/types";

interface ReceiptFieldProps {
  receiptUrl: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScanComplete?: (expenseDetails: ScanResult) => void;
  onItemsExtracted?: (receiptData: ReceiptScanResult) => void;
}

export function ReceiptField({ 
  receiptUrl, 
  onFileChange, 
  onScanComplete,
  onItemsExtracted 
}: ReceiptFieldProps) {
  const { isScanning, canScanReceipt, handleScanReceipt } = useReceiptScanner({
    receiptUrl,
    onScanComplete,
    onItemsExtracted
  });

  const handleUpload = () => {
    document.getElementById('expense-receipt')?.click();
  };

  const handleCapture = () => {
    const input = document.getElementById('expense-receipt') as HTMLInputElement;
    if (input) {
      input.setAttribute('capture', 'environment');
      input.click();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="expense-receipt">Receipt</Label>
      <div className="space-y-2">
        <ReceiptPreview 
          receiptUrl={receiptUrl} 
          onReplace={handleUpload} 
        />
        
        <Input
          id="expense-receipt"
          name="receipt"
          type="file"
          accept="image/*,.pdf"
          onChange={onFileChange}
          className="hidden"
        />
        
        <ReceiptActions
          onUpload={handleUpload}
          onCapture={handleCapture}
          onScan={handleScanReceipt}
          canScan={canScanReceipt}
          isScanning={isScanning}
          receiptUrl={receiptUrl}
          showSeparateButtons={true}
        />
      </div>
    </div>
  );
}
