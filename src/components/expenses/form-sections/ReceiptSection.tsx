
import { ReceiptField } from "../form-fields/ReceiptField";

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
  isManualForm = true // Default to true for backward compatibility
}: ReceiptSectionProps) {
  return (
    <div>
      <h3 className="text-base font-medium mb-2">Receipt</h3>
      <p className="text-sm text-muted-foreground mb-3">
        {isManualForm 
          ? "Upload a receipt image to attach to this expense" 
          : "Upload a receipt image or take a photo for automatic processing"}
      </p>
      <ReceiptField 
        receiptUrl={receiptUrl} 
        onFileChange={onFileChange}
        setFileInputRef={setFileInputRef}
        setCameraInputRef={setCameraInputRef}
        onCapture={onCapture}
        autoProcess={!isManualForm} // Only auto-process if it's not from manual form
      />
      {isUploading && (
        <p className="text-xs text-muted-foreground mt-2">
          Uploading receipt...
        </p>
      )}
    </div>
  );
}
