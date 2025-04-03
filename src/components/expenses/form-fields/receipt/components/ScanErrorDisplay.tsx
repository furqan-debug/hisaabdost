
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ScanErrorDisplayProps {
  scanError: string | null;
  scanTimedOut: boolean;
}

export function ScanErrorDisplay({
  scanError,
  scanTimedOut
}: ScanErrorDisplayProps) {
  const errorMessage = scanError || 
    (scanTimedOut ? "Scan timed out. Please try again." : "An error occurred during scanning.");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">Processing Error</h3>
          <div className="mt-2 text-sm">
            <p>{errorMessage}</p>
          </div>
          <div className="mt-3">
            <p className="text-xs">
              Try uploading a clearer image or manually enter your expense details.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
