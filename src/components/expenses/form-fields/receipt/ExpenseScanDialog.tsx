
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
  // Debug logging to track dialog visibility
  console.log("ExpenseScanDialog render:", {
    initialFile: initialFile ? `${initialFile.name} (${initialFile.size} bytes)` : null,
    filePreviewUrl: filePreviewUrl ? "exists" : null,
    showScanDialog,
    isManualEntry
  });

  if (isManualEntry || !initialFile || !filePreviewUrl) {
    console.log("ExpenseScanDialog not rendering due to:", 
      isManualEntry ? "manual entry mode" : 
      !initialFile ? "no file" : 
      "no preview URL");
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
