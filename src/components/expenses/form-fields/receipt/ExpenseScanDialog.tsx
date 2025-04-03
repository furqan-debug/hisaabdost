
import { ReceiptScanDialog } from "./ReceiptScanDialog";

interface ExpenseScanDialogProps {
  initialFile: File | null;
  filePreviewUrl: string | null;
  showScanDialog: boolean;
  setShowScanDialog: (show: boolean) => void;
  isManualEntry: boolean;
  onCleanup: () => void;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  onSuccess?: () => void;
}

export function ExpenseScanDialog({
  initialFile,
  filePreviewUrl,
  showScanDialog,
  setShowScanDialog,
  isManualEntry,
  onCleanup,
  onCapture,
  onSuccess
}: ExpenseScanDialogProps) {
  if (isManualEntry || !initialFile || !filePreviewUrl) {
    return null;
  }

  return (
    <ReceiptScanDialog
      file={initialFile}
      previewUrl={filePreviewUrl}
      open={showScanDialog}
      setOpen={setShowScanDialog}
      onCleanup={onCleanup}
      onCapture={onCapture}
      autoSave={true}
      autoProcess={true}
      onSuccess={onSuccess}
    />
  );
}
