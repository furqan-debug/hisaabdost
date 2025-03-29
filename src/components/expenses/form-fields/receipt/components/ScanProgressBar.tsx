
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface ScanProgressBarProps {
  progress: number;
  isScanning: boolean;
}

export function ScanProgressBar({ progress, isScanning }: ScanProgressBarProps) {
  // Calculate progress color based on percentage
  const getProgressColor = () => {
    if (progress < 30) return '#f59e0b'; // Amber
    if (progress < 70) return '#3b82f6'; // Blue
    return '#10b981'; // Green
  };

  return (
    <div className="w-full max-w-[300px] px-4">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Progress 
          value={progress} 
          className="h-2 bg-secondary"
          // Instead of using style with CSS vars, use tailwind classes
          indicatorClassName={`bg-${progress < 30 ? 'amber-500' : progress < 70 ? 'blue-500' : 'emerald-500'}`}
        />
      </motion.div>
    </div>
  );
}
