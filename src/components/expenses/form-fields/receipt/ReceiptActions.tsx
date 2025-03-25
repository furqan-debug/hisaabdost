
import { ReceiptButton } from "./components/ReceiptButton";

interface ReceiptActionsProps {
  onUpload: () => void;
  onCapture?: () => void;
  onRetry?: () => void;
  receiptUrl: string;
  showCameraButton?: boolean;
  showRetryButton?: boolean;
  isProcessing?: boolean;
}

export function ReceiptActions({
  onUpload,
  onCapture,
  onRetry,
  receiptUrl,
  showCameraButton = false,
  showRetryButton = false,
  isProcessing = false
}: ReceiptActionsProps) {
  const hasReceipt = !!receiptUrl;
  
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {!hasReceipt ? (
        // If no receipt is uploaded yet
        <>
          <ReceiptButton
            type="button"
            variant="outline"
            icon="upload"
            onClick={onUpload}
            disabled={isProcessing}
            className="flex-1"
          >
            Upload Receipt
          </ReceiptButton>
          
          {showCameraButton && onCapture && (
            <ReceiptButton
              type="button"
              variant="outline"
              icon="camera"
              onClick={onCapture}
              disabled={isProcessing}
              className="flex-1"
            >
              Take Photo
            </ReceiptButton>
          )}
        </>
      ) : (
        // If a receipt is already uploaded
        <>
          <ReceiptButton
            type="button"
            variant="outline"
            icon="upload"
            onClick={onUpload}
            disabled={isProcessing}
            className="flex-1"
          >
            Replace Receipt
          </ReceiptButton>
          
          {showRetryButton && onRetry && (
            <ReceiptButton
              type="button"
              variant="outline"
              icon="retry"
              onClick={onRetry}
              disabled={isProcessing}
              className="flex-1"
            >
              Retry Scan
            </ReceiptButton>
          )}
        </>
      )}
    </div>
  );
}
