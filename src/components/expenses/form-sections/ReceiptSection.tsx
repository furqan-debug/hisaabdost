
import { ReceiptField } from "../form-fields/ReceiptField";
import { useEffect, useState } from "react";

interface ReceiptSectionProps {
  receiptUrl: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
  setFileInputRef?: (ref: HTMLInputElement | null) => void;
  setCameraInputRef?: (ref: HTMLInputElement | null) => void;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  isManualForm?: boolean;
}

export function ReceiptSection({ 
  receiptUrl, 
  onFileChange,
  isUploading = false,
  setFileInputRef,
  setCameraInputRef,
  onCapture,
  isManualForm = false
}: ReceiptSectionProps) {
  const [hasReceipt, setHasReceipt] = useState(!!receiptUrl);
  
  // Update hasReceipt state when receiptUrl changes
  useEffect(() => {
    setHasReceipt(!!receiptUrl);
  }, [receiptUrl]);
  
  // Modified onFileChange handler to prevent manual form interference
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only call the parent onFileChange if we're in manual form mode
    // For auto-processing mode, the ReceiptField handles everything internally
    if (isManualForm) {
      onFileChange(e);
    }
  };
  
  return (
    <div>
      <h3 className="text-base font-medium mb-2">Receipt</h3>
      <p className="text-sm text-muted-foreground mb-3">
        {isManualForm 
          ? "Upload a receipt image to attach to this expense" 
          : "Upload a receipt image and we'll automatically extract and save all items as expenses"}
      </p>
      <ReceiptField 
        receiptUrl={receiptUrl} 
        onFileChange={handleFileChange}
        setFileInputRef={setFileInputRef}
        setCameraInputRef={setCameraInputRef}
        onCapture={onCapture}
        autoProcess={!isManualForm}
      />
      {isUploading && (
        <p className="text-xs text-muted-foreground mt-2">
          Uploading receipt...
        </p>
      )}
      {hasReceipt && !isUploading && (
        <p className="text-xs text-green-600 mt-2">
          Receipt successfully uploaded
        </p>
      )}
    </div>
  );
}
