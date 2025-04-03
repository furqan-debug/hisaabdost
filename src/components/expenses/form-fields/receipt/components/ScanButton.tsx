
import { Button } from "@/components/ui/button";
import { ScanLine, Loader2, RefreshCw, Check } from "lucide-react";
import { motion } from "framer-motion";

interface ScanButtonProps {
  isScanning: boolean;
  scanTimedOut: boolean;
  onClick: () => void;
  disabled: boolean;
  autoSave?: boolean;
  isAutoProcessing?: boolean;
  scanProgress?: number;
  statusMessage?: string;
  processingComplete?: boolean;
}

export function ScanButton({
  isScanning,
  scanTimedOut,
  onClick,
  disabled,
  autoSave = false,
  isAutoProcessing = false,
  scanProgress = 0,
  statusMessage,
  processingComplete = false
}: ScanButtonProps) {
  const buttonText = () => {
    if (processingComplete) return "Completed";
    if (isScanning) return "Processing...";
    if (isAutoProcessing) return "Auto-Processing...";
    if (scanTimedOut) return "Retry Scan";
    return `Process Receipt${autoSave ? " & Save" : ""}`;
  };

  // Determine button variant based on state
  const variant = processingComplete 
    ? "outline" 
    : scanTimedOut 
      ? "destructive" 
      : "default";
  
  // Button size based on state
  const size = "default";

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex-1"
    >
      <Button
        type="button"
        variant={variant}
        onClick={onClick}
        disabled={disabled || processingComplete}
        className={`w-full elastic-hover ${
          (isScanning || isAutoProcessing) ? 'animate-pulse' : ''
        }`}
        size={size}
      >
        {processingComplete ? (
          <>
            <Check className="mr-2 h-4 w-4 text-green-500" />
            {buttonText()}
          </>
        ) : (isScanning || isAutoProcessing) ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>{buttonText()}</span>
            {scanProgress > 0 && scanProgress < 100 && (
              <span className="ml-1.5 text-xs bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-full">
                {Math.round(scanProgress)}%
              </span>
            )}
          </>
        ) : scanTimedOut ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            {buttonText()}
          </>
        ) : (
          <>
            <ScanLine className="mr-2 h-4 w-4" />
            {buttonText()}
          </>
        )}
      </Button>
    </motion.div>
  );
}
