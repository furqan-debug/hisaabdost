
import React from 'react';
import { motion } from 'framer-motion';

interface ScanStatusProps {
  message?: string;
  progress: number;
  isScanning: boolean;
}

export function ScanStatus({ message, progress, isScanning }: ScanStatusProps) {
  const defaultMessages = {
    0: 'Preparing to scan...',
    20: 'Analyzing receipt...',
    40: 'Extracting text...',
    60: 'Identifying items...',
    80: 'Finalizing data...',
    100: 'Scan complete!'
  };

  // If no message is provided, use a default based on progress
  const statusMessage = message || 
    Object.entries(defaultMessages)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .find(([threshold]) => progress <= parseInt(threshold))?.[1] ||
    defaultMessages[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-2 text-sm text-center max-w-[300px] text-muted-foreground"
    >
      <p>{statusMessage}</p>
      {progress > 0 && progress < 100 && (
        <p className="text-xs mt-1">{Math.round(progress)}% complete</p>
      )}
    </motion.div>
  );
}
