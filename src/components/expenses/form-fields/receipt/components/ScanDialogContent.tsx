
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle } from "lucide-react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DialogActions } from "./DialogActions";

interface ScanDialogContentProps {
  previewUrl: string | null;
  isScanning: boolean;
  isAutoProcessing: boolean;
  scanProgress: number;
  statusMessage?: string;
  scanTimedOut: boolean;
  scanError: string | null;
  handleScanReceipt: () => void;
  onCleanup: () => void;
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
  fileExists
}: ScanDialogContentProps) {
  const processing = isScanning || isAutoProcessing;
  const showErrorMessage = scanTimedOut || scanError;

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Processing Receipt</DialogTitle>
        <DialogDescription>
          We'll extract all items and save them automatically as separate expenses
        </DialogDescription>
      </DialogHeader>

      {previewUrl && (
        <div className="relative w-full h-64 bg-black flex items-center justify-center overflow-hidden rounded-md border">
          <img
            src={previewUrl}
            alt="Receipt preview"
            className="max-w-full max-h-full object-contain opacity-70"
          />
          <div className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded-sm">
            Preview only
          </div>
        </div>
      )}

      {processing && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-sm">
              {statusMessage || "Processing receipt..."}
            </p>
          </div>
          <Progress value={scanProgress} className="h-2" />
        </div>
      )}

      {showErrorMessage && (
        <div className="flex items-start gap-2 bg-amber-50 p-2 rounded-md text-amber-700 text-sm border border-amber-200">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Processing issue</p>
            <p>{scanError || "Processing timed out. Please try again."}</p>
          </div>
        </div>
      )}

      <DialogActions
        onCleanup={onCleanup}
        isScanning={isScanning}
        isAutoProcessing={isAutoProcessing}
        scanTimedOut={scanTimedOut}
        handleScanReceipt={handleScanReceipt}
        disabled={!fileExists}
        autoSave={true}
        scanProgress={scanProgress}
        statusMessage={statusMessage}
      />
    </div>
  );
}
