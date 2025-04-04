
import { ReceiptScanDialog } from "./ReceiptScanDialog";
import { useEffect } from "react";

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

  // Auto open dialog when needed
  useEffect(() => {
    if (!isManualEntry && initialFile && filePreviewUrl && !showScanDialog) {
      console.log("Auto-opening scan dialog due to file being present");
      setTimeout(() => {
        setShowScanDialog(true);
      }, 100);
    }
  }, [initialFile, filePreviewUrl, showScanDialog, setShowScanDialog, isManualEntry]);

  if (isManualEntry) {
    console.log("ExpenseScanDialog not rendering: manual entry mode");
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
