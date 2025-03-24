
import { Button } from "@/components/ui/button";
import { Upload, Camera } from "lucide-react";

interface ReceiptActionsProps {
  onUpload: () => void;
  onCapture: () => void;
  onScan: () => void;
  canScan: boolean;
  isScanning: boolean;
  receiptUrl: string;
  showSeparateButtons?: boolean;
}

export function ReceiptActions({
  onUpload,
  onCapture,
  onScan,
  canScan,
  isScanning,
  receiptUrl,
  showSeparateButtons = false
}: ReceiptActionsProps) {
  const hasReceipt = !!receiptUrl;
  
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {!hasReceipt ? (
        // If no receipt is uploaded yet, show upload buttons
        <>
          {showSeparateButtons ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onUpload}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Receipt
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onUpload}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Add Receipt
            </Button>
          )}
        </>
      ) : (
        // If a receipt is already uploaded
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onUpload}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            Replace Receipt
          </Button>
        </div>
      )}
    </div>
  );
}
