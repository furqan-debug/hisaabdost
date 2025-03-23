
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ReceiptPreview } from "./receipt/ReceiptPreview";
import { ReceiptActions } from "./receipt/ReceiptActions";
import { useReceiptScanner } from "./receipt/ReceiptScanner";
import { ReceiptScanResult, ScanResult } from "@/hooks/expense-form/types";
import { useRef } from "react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isScanning, canScanReceipt, handleScanReceipt } = useReceiptScanner({
    receiptUrl,
    onScanComplete,
    onItemsExtracted
  });

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
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
          ref={fileInputRef}
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
