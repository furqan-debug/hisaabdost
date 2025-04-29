
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useProgressAnimation } from '../hooks/useProgressAnimation';
import { getProgressStyles } from '../utils/progressColors';

interface ScanProgressBarProps {
  progress: number;
  isScanning?: boolean;
}

export function ScanProgressBar({ progress, isScanning = true }: ScanProgressBarProps) {
  const displayedProgress = useProgressAnimation({ 
    isScanning, 
    backendProgress: progress 
  });

  // Get gradient styles for smooth color transitions
  const progressStyles = getProgressStyles(displayedProgress);

  return (
    <div className="w-full max-w-[300px] px-4">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <Progress 
          value={displayedProgress} 
          className="h-2.5 bg-secondary/30 overflow-hidden" 
          indicatorClassName={`bg-gradient-to-r ${progressStyles.className}`}
          indicatorStyle={{ background: progressStyles.background }}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span className="font-medium text-foreground/80">
            {Math.round(displayedProgress)}% complete
          </span>
          <span>100%</span>
        </div>
      </motion.div>
    </div>
  );
}
