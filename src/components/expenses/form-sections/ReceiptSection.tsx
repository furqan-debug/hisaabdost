
import { ReceiptField } from "../form-fields/ReceiptField";

interface ReceiptSectionProps {
  receiptUrl: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
  setFileInputRef?: (ref: HTMLInputElement | null) => void;
  setCameraInputRef?: (ref: HTMLInputElement | null) => void;
}

export function ReceiptSection({ 
  receiptUrl, 
  onFileChange,
  isUploading = false,
  setFileInputRef,
  setCameraInputRef
}: ReceiptSectionProps) {
  return (
    <div>
      <h3 className="text-base font-medium mb-2">Receipt</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Upload a receipt image or take a photo for your records
      </p>
      <ReceiptField 
        receiptUrl={receiptUrl} 
        onFileChange={onFileChange}
        setFileInputRef={setFileInputRef}
        setCameraInputRef={setCameraInputRef}
      />
      {isUploading && (
        <p className="text-xs text-muted-foreground mt-2">
          Uploading receipt...
        </p>
      )}
    </div>
  );
}
