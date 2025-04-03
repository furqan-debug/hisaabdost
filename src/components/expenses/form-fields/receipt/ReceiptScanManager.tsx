
import { ReceiptScanDialog } from "./ReceiptScanDialog";

interface ReceiptScanManagerProps {
  file: File | null;
  previewUrl: string | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  onCleanup: () => void;
  onCapture?: (expenseDetails: {
    description: string;
    amount: string;
    date: string;
    category: string;
    paymentMethod: string;
  }) => void;
  autoSave?: boolean;
  autoProcess?: boolean;
  onSuccess?: () => void;
}

export function ReceiptScanManager({
  file,
  previewUrl,
  open,
  setOpen,
  onCleanup,
  onCapture,
  autoSave = true,
  autoProcess = true,
  onSuccess
}: ReceiptScanManagerProps) {
  if (!file || !previewUrl) {
    return null;
  }
  
  return (
    <ReceiptScanDialog
      file={file}
      previewUrl={previewUrl}
      open={open}
      setOpen={setOpen}
      onCleanup={onCleanup}
      onCapture={onCapture}
      autoSave={autoSave}
      autoProcess={autoProcess}
      onSuccess={onSuccess}
    />
  );
}
