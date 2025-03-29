
import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScanErrorDisplayProps {
  scanError: string | null;
  scanTimedOut: boolean;
}

export function ScanErrorDisplay({ scanError, scanTimedOut }: ScanErrorDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700"
    >
      <div className="flex items-start gap-2">
        {scanTimedOut ? (
          <Clock className="h-5 w-5 text-red-500 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
        )}
        <div>
          <h4 className="text-sm font-medium mb-1">
            {scanTimedOut ? "Processing Timed Out" : "Processing Error"}
          </h4>
          <p className="text-xs">
            {scanTimedOut
              ? "The receipt processing took too long. Please try again or enter details manually."
              : scanError || "Failed to process receipt. Please try again or enter details manually."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
