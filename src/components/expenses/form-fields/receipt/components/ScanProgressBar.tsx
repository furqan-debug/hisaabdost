import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface ScanProgressBarProps {
  progress: number;  // Backend progress
  isScanning?: boolean;
}

export function ScanProgressBar({ progress, isScanning = true }: ScanProgressBarProps) {
  const [displayedProgress, setDisplayedProgress] = useState(0);

  useEffect(() => {
    if (!isScanning) return;

    // Smoothly increase displayed progress every 100ms
    const interval = setInterval(() => {
      setDisplayedProgress((prev) => {
        // Never jump more than 2% per tick
        if (prev < progress) {
          return Math.min(prev + 1, progress);
        }
        return prev;
      });
    }, 30); // very smooth and fast

    return () => clearInterval(interval);
  }, [progress, isScanning]);

  const getIndicatorClassName = () => {
    if (displayedProgress < 30) return 'bg-amber-500';
    if (displayedProgress < 70) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="w-full max-w-[300px] px-4">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Progress 
          value={displayedProgress} 
          className="h-2 bg-secondary"
          indicatorClassName={getIndicatorClassName()}
        />
      </motion.div>
    </div>
  );
}
