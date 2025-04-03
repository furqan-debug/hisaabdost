
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface ScanProgressBarProps {
  progress: number;
  isScanning?: boolean;
}

export function ScanProgressBar({ progress, isScanning = true }: ScanProgressBarProps) {
  // Get the appropriate color class based on the progress value
  const getIndicatorClassName = () => {
    if (progress < 30) return 'bg-amber-500';
    if (progress < 70) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="w-full max-w-[300px] px-4">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-1"
      >
        <Progress 
          value={progress} 
          className="h-3 bg-secondary/50 rounded-full overflow-hidden"
          indicatorClassName={`${getIndicatorClassName()} transition-all duration-700 ease-out relative`}
        />
        
        {/* Add subtle pulse effect to the progress bar */}
        {isScanning && progress < 100 && (
          <motion.div 
            className="h-3 absolute top-0 left-0 rounded-full bg-white/30"
            style={{ width: `${progress * 0.7}%` }}
            animate={{ 
              opacity: [0, 0.5, 0],
              x: [`${progress * 0.3}%`, `${progress}%`] 
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
