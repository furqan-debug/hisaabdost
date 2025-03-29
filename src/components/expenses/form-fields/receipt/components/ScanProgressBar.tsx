
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface ScanProgressBarProps {
  progress: number;
  isScanning: boolean;
}

export function ScanProgressBar({ progress, isScanning }: ScanProgressBarProps) {
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
          style={{
            '--progress-color': progress < 30 ? '#f59e0b' : 
                               progress < 70 ? '#3b82f6' : 
                               progress < 100 ? '#10b981' : '#10b981'
          }}
        />
      </motion.div>
    </div>
  );
}
