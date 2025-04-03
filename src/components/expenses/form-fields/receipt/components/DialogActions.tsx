
import { ScanButton } from "./ScanButton";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface DialogActionsProps {
  onCleanup: () => void;
  isScanning: boolean;
  isAutoProcessing: boolean;
  scanTimedOut: boolean;
  handleScanReceipt: () => void;
  disabled: boolean;
  autoSave: boolean;
  scanProgress?: number;
  statusMessage?: string;
  autoProcess?: boolean;
  processingComplete: boolean;
}

export function DialogActions({
  onCleanup,
  isScanning,
  isAutoProcessing,
  scanTimedOut,
  handleScanReceipt,
  disabled,
  autoSave,
  scanProgress = 0,
  statusMessage,
  autoProcess = false,
  processingComplete
}: DialogActionsProps) {
  const scanning = isScanning || isAutoProcessing;
  
  return (
    <div className="flex flex-row gap-3 mt-2">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex-1"
      >
        <Button
          type="button"
          variant="outline"
          onClick={onCleanup}
          disabled={scanning && !processingComplete && !scanTimedOut}
          className="w-full"
        >
          <X className="mr-2 h-4 w-4" />
          {processingComplete ? "Close" : "Cancel"}
        </Button>
      </motion.div>
      
      {!autoProcess && (
        <ScanButton
          isScanning={isScanning}
          isAutoProcessing={isAutoProcessing}
          scanTimedOut={scanTimedOut}
          onClick={handleScanReceipt}
          disabled={disabled || scanning}
          autoSave={autoSave}
          scanProgress={scanProgress}
          statusMessage={statusMessage}
          processingComplete={processingComplete}
        />
      )}
    </div>
  );
}
