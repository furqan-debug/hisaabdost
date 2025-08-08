
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
  // Add new prop to indicate if this is from the manual form or auto-process mode
  isManualForm?: boolean;
}

export function ReceiptSection({ 
  receiptUrl, 
  onFileChange,
  isUploading = false,
  setFileInputRef,
  setCameraInputRef,
  onCapture,
  isManualForm = false // Default to auto-processing mode
}: ReceiptSectionProps) {
  const [hasReceipt, setHasReceipt] = useState(!!receiptUrl);
  
  // Update hasReceipt state when receiptUrl changes
  useEffect(() => {
    setHasReceipt(!!receiptUrl);
  }, [receiptUrl]);
  
  return (
    <div>
      <h3 className="text-base font-medium mb-2">Receipt</h3>
      <p className="text-sm text-muted-foreground mb-3">
        {isManualForm 
          ? "Upload a receipt image to attach to this expense (optional)" 
          : "Upload a receipt image and we'll automatically extract and save all items as expenses"}
      </p>
      <ReceiptField 
        receiptUrl={receiptUrl} 
        onFileChange={onFileChange}
        setFileInputRef={setFileInputRef}
        setCameraInputRef={setCameraInputRef}
        onCapture={onCapture}
        autoProcess={!isManualForm} // Always auto-process when not in manual form
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
