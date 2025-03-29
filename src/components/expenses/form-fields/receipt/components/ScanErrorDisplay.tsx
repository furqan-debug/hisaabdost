
import { AlertTriangle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface ScanErrorDisplayProps {
  scanError: string | null;
  scanTimedOut: boolean;
}

export function ScanErrorDisplay({ scanError, scanTimedOut }: ScanErrorDisplayProps) {
  if (!scanError && !scanTimedOut) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive"
    >
      <div className="flex items-start gap-2">
        {scanTimedOut ? (
          <Clock className="h-5 w-5 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
        )}
        <div>
          <h4 className="text-sm font-medium">
            {scanTimedOut ? "Processing Timeout" : "Processing Error"}
          </h4>
          <p className="text-xs mt-1">
            {scanTimedOut 
              ? "Receipt processing took too long. Please try again or enter details manually."
              : scanError || "There was a problem processing your receipt."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
