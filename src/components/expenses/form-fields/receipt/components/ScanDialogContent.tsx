
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ReceiptPreview } from "../ReceiptPreview";
import { DialogActions } from "./DialogActions";
import { ScanProgressBar } from "./ScanProgressBar";
import { ScanErrorDisplay } from "./ScanErrorDisplay";
import { ScanStatus } from "./ScanStatus";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Check, ScanLine } from "lucide-react";

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
  // Determine if we're in a scanning/processing state
  const scanning = isScanning || isAutoProcessing;
  
  // Determine if we're in an error state
  const hasError = !!scanError || scanTimedOut;

  // Get stage-appropriate badge color
  const getBadgeVariant = () => {
    if (processingComplete) return "success";
    if (hasError) return "destructive";
    if (scanning) return "default";
    return "secondary";
  };
  
  return (
    <div className="flex flex-col gap-4">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl">
            {processingComplete 
              ? "Receipt Processed"
              : hasError
                ? "Processing Error"
                : scanning
                  ? "Processing Receipt..."
                  : "Scan Receipt"
            }
          </DialogTitle>
          <Badge variant={getBadgeVariant()} className="animate-pulse py-1">
            {processingComplete 
              ? "Complete" 
              : hasError 
                ? "Failed" 
                : scanning 
                  ? `${Math.round(scanProgress)}%` 
                  : "Ready"}
          </Badge>
        </div>
        <DialogDescription className="mt-2">
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
      
      {/* Receipt preview with scanning effects */}
      <div className="relative rounded-lg overflow-hidden bg-muted/20 border shadow-inner">
        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div 
              key="receipt-preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative"
            >
              <div className={`relative ${scanning ? 'animate-scan-line' : ''}`}>
                <ReceiptPreview
                  receiptUrl={previewUrl} 
                  onReplace={null} 
                  disabled={scanning}
                  className="min-h-[300px] max-h-[400px] object-contain w-full"
                />
                
                {scanning && (
                  <motion.div 
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Horizontal scan line effect */}
                    <motion.div
                      className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                      initial={{ top: "0%" }}
                      animate={{ top: "100%" }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                      }}
                    />
                    
                    {/* Four corner scan indicators */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary" />
                  </motion.div>
                )}
                
                {/* Completion checkmark overlay */}
                {processingComplete && (
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      className="bg-green-500 rounded-full p-3 shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        damping: 10, 
                        stiffness: 200,
                        delay: 0.3
                      }}
                    >
                      <Check className="h-8 w-8 text-white" />
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty-receipt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[300px] bg-muted flex flex-col items-center justify-center rounded-md p-6 gap-3"
            >
              <ScanLine className="h-12 w-12 text-muted-foreground mb-2 opacity-40" />
              <span className="text-muted-foreground text-center">No receipt selected</span>
              <span className="text-xs text-muted-foreground text-center">
                Upload a receipt image to begin scanning
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Show scan progress overlay */}
        {scanning && previewUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background/30 backdrop-blur-[2px]"
          >
            <ScanProgressBar progress={scanProgress} isScanning={scanning} />
            <ScanStatus 
              message={statusMessage} 
              progress={scanProgress} 
              isScanning={scanning} 
            />
          </motion.div>
        )}
      </div>
      
      {/* Error display */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <ScanErrorDisplay 
              scanError={scanError}
              scanTimedOut={scanTimedOut}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Success message */}
      <AnimatePresence>
        {processingComplete && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ 
              duration: 0.4,
              delay: 0.2
            }}
            className="p-4 rounded-md bg-green-50 border border-green-200 text-green-700 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-1 mt-0.5">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Receipt successfully processed!</p>
                <p className="text-xs mt-1 text-green-600/80">
                  All items from your receipt have been added to your expenses.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Actions */}
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
