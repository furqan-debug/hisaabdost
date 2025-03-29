
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DialogActions } from "./DialogActions";
import { cn } from "@/lib/utils";
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
  processingComplete?: boolean;
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
  processingComplete = false
}: ScanDialogContentProps) {
  const processing = isScanning || isAutoProcessing;
  const showErrorMessage = scanTimedOut || scanError;

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DialogHeader>
        <DialogTitle>Processing Receipt</DialogTitle>
        <DialogDescription>
          We'll extract all items and save them automatically as separate expenses
        </DialogDescription>
      </DialogHeader>

      {previewUrl && (
        <motion.div 
          className="relative w-full h-64 bg-black flex items-center justify-center overflow-hidden rounded-md border"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <img
            src={previewUrl}
            alt="Receipt preview"
            className={cn(
              "max-w-full max-h-full object-contain transition-opacity duration-300",
              processing ? "opacity-60" : "opacity-80"
            )}
          />
          {processing && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-black/40 rounded-full p-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </motion.div>
          )}
          {processingComplete && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <div className="bg-green-500/20 backdrop-blur-sm rounded-full p-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </motion.div>
          )}
          <div className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded-sm">
            Preview only
          </div>
        </motion.div>
      )}

      {processing && (
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-sm">
              {statusMessage || "Processing receipt..."}
            </p>
          </div>
          <Progress 
            value={scanProgress} 
            className="h-2 overflow-hidden" 
            indicatorClassName={cn(
              "transition-all duration-500",
              scanProgress < 30 ? "bg-amber-500" : 
              scanProgress < 70 ? "bg-blue-500" : 
              "bg-green-500"
            )}
          />
        </motion.div>
      )}

      {processingComplete && !showErrorMessage && (
        <motion.div 
          className="flex items-start gap-2 bg-green-50 p-3 rounded-md text-green-700 text-sm border border-green-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Processing complete</p>
            <p>All items have been added to your expenses list</p>
          </div>
        </motion.div>
      )}

      {showErrorMessage && (
        <motion.div 
          className="flex items-start gap-2 bg-amber-50 p-2 rounded-md text-amber-700 text-sm border border-amber-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Processing issue</p>
            <p>{scanError || "Processing timed out. Please try again."}</p>
          </div>
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
      />
    </motion.div>
  );
}
