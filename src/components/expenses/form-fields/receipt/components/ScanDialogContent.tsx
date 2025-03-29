
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DialogActions } from "./DialogActions";
import { ScanProgress } from "./ScanProgress";
import { ScanTimeoutMessage } from "./ScanTimeoutMessage";
import { ReceiptPreviewImage } from "./ReceiptPreviewImage";

interface ScanDialogContentProps {
  previewUrl: string | null;
  isScanning: boolean;
  isAutoProcessing: boolean;
  scanProgress: number;
  statusMessage: string;
  scanTimedOut: boolean;
  scanError: string | null;
  handleScanReceipt: () => void;
  onCleanup: () => void;
  onManualEntry?: () => void;
  fileExists: boolean;
}

export function ScanDialogContent({
  previewUrl,
  isScanning,
  isAutoProcessing,
  scanProgress,
  statusMessage,
  scanTimedOut,
  scanError,
  handleScanReceipt,
  onCleanup,
  onManualEntry,
  fileExists
}: ScanDialogContentProps) {
  return (
    <>
      <DialogTitle>Processing Receipt</DialogTitle>
      <DialogDescription>
        We'll extract all items and save them automatically as separate expenses
      </DialogDescription>
      
      <div className="flex flex-col items-center space-y-4">
        {/* Only show preview if we have a URL */}
        {previewUrl && <ReceiptPreviewImage previewUrl={previewUrl} />}
        
        <ScanProgress
          isScanning={isScanning || isAutoProcessing}
          progress={scanProgress}
          statusMessage={statusMessage}
        />
        
        <ScanTimeoutMessage 
          scanTimedOut={scanTimedOut}
          scanError={scanError}
        />
        
        <DialogActions
          onCleanup={onCleanup}
          isScanning={isScanning}
          isAutoProcessing={isAutoProcessing}
          scanTimedOut={scanTimedOut || !!scanError}
          handleScanReceipt={handleScanReceipt}
          disabled={!fileExists}
          autoSave={true}
          scanProgress={scanProgress}
          statusMessage={statusMessage}
          onManualEntry={onManualEntry}
        />
      </div>
    </>
  );
}
