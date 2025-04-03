
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

  // Define animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="rounded-lg border border-red-200 bg-red-50/80 backdrop-blur-sm p-4 text-red-800 shadow-sm"
    >
      <div className="flex items-start">
        <motion.div 
          className="flex-shrink-0"
          variants={itemVariants}
        >
          <div className="p-1.5 bg-red-100 rounded-full">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
        </motion.div>
        <div className="ml-3 w-full">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Processing Error</h3>
            <Badge variant="warning" className="text-xs">Failed</Badge>
          </motion.div>
          <motion.div 
            variants={itemVariants}
            className="mt-2 text-sm"
          >
            <p>{errorMessage}</p>
          </motion.div>
          <motion.div 
            variants={itemVariants}
            className="mt-3 text-xs text-red-700/80"
          >
            <p>
              Try uploading a clearer image or manually enter your expense details.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
