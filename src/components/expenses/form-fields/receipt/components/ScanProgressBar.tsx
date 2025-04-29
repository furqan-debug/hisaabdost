
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useProgressAnimation } from '../hooks/useProgressAnimation';
import { getProgressColor } from '../utils/progressColors';

interface ScanProgressBarProps {
  progress: number;
  isScanning?: boolean;
}

export function ScanProgressBar({ progress, isScanning = true }: ScanProgressBarProps) {
  const displayedProgress = useProgressAnimation({ 
    isScanning, 
    backendProgress: progress 
  });

  return (
    <div className="w-full max-w-[300px] px-4">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Progress 
          value={displayedProgress} 
          className="h-2 bg-secondary/30" // Lighter background for better contrast
          indicatorClassName={getProgressColor(displayedProgress)}
        />
        <div className="text-xs text-center mt-1 text-muted-foreground">
          {Math.round(displayedProgress)}% complete
        </div>
      </motion.div>
    </div>
  );
}
