
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface ScanProgressBarProps {
  progress: number;
  isScanning?: boolean;
}

export function ScanProgressBar({ progress, isScanning = true }: ScanProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  // Smoothly animate to the target progress value
  useEffect(() => {
    if (!isScanning) return;
    
    // Create artificial progress points for smoother animation
    const intermediateSteps = [
      { target: Math.min(30, progress), duration: 1000 },
      { target: Math.min(60, progress), duration: 1500 },
      { target: Math.min(85, progress), duration: 2000 },
      { target: progress, duration: 2500 }
    ];
    
    // Animate through each step
    intermediateSteps.forEach(({ target, duration }, index) => {
      if (target > animatedProgress) {
        setTimeout(() => {
          setAnimatedProgress(prev => {
            const increment = (target - prev) / 10;
            return Math.min(target, prev + increment);
          });
        }, duration);
      }
    });
    
  }, [progress, isScanning, animatedProgress]);
  
  // Get the appropriate color class based on the progress value
  const getIndicatorClassName = () => {
    if (animatedProgress < 30) return 'bg-amber-500';
    if (animatedProgress < 70) return 'bg-blue-500';
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
          value={animatedProgress} 
          className="h-2 bg-secondary"
          indicatorClassName={getIndicatorClassName()}
        />
      </motion.div>
    </div>
  );
}
