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
    <ReceiptField
      receiptUrl={receiptUrl}
      onFileChange={onFileChange}
      setFileInputRef={setFileInputRef}
      setCameraInputRef={setCameraInputRef}
      onCapture={onCapture}
      autoProcess={!isManualForm}
    />
  );
}