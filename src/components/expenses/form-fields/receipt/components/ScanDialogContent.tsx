import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ReceiptPreview } from "../ReceiptPreview";
import { DialogActions } from "./DialogActions";
import { ReceiptProcessingAnimation } from "./ReceiptProcessingAnimation";
import { ScanErrorDisplay } from "./ScanErrorDisplay";
import { motion } from "framer-motion";

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
  processingComplete: boolean;
  autoProcess: boolean;
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
  fileExists,
  processingComplete,
  autoProcess
}: ScanDialogContentProps) {
  const scanning = isScanning || isAutoProcessing;
  const hasError = !!scanError || scanTimedOut;

  return (
    <div className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>
          {processingComplete 
            ? "Receipt Processing Complete"
            : hasError
              ? "Receipt Processing Error"
              : scanning
                ? "Processing Receipt..."
                : "Scan Receipt"
          }
        </DialogTitle>
        <DialogDescription>
          {processingComplete
            ? "All items from your receipt have been added to your expenses."
            : hasError
              ? "There was a problem processing your receipt."
              : scanning
                ? `${statusMessage || "Extracting information from your receipt..."}`
                : autoProcess
                  ? "Your receipt will be automatically processed and items added to your expenses."
                  : "Scan your receipt to extract expense details."
          }
        </DialogDescription>
      </DialogHeader>
      
      <div className="relative rounded-md overflow-hidden">
        {previewUrl ? (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ReceiptPreview
              receiptUrl={previewUrl} 
              onReplace={null} 
              disabled={scanning}
              className="min-h-[300px] max-h-[400px] object-contain w-full"
            />
          </motion.div>
        ) : (
          <div className="h-[300px] bg-muted flex items-center justify-center rounded-md">
            <span className="text-muted-foreground">No receipt selected</span>
          </div>
        )}
        
        {scanning && (
          <ReceiptProcessingAnimation 
            progress={scanProgress}
            message={statusMessage}
          />
        )}
      </div>
      
      {hasError && (
        <ScanErrorDisplay 
          scanError={scanError}
          scanTimedOut={scanTimedOut}
        />
      )}
      
      {processingComplete && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700"
        >
          <p className="text-sm font-medium">Receipt successfully processed!</p>
          <p className="text-xs mt-1">
            All items from your receipt have been added to your expenses.
          </p>
        </motion.div>
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
        autoProcess={autoProcess}
        processingComplete={processingComplete}
      />
    </div>
  );
}
