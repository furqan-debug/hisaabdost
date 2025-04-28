
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
    if (!isScanning) {
      setAnimatedProgress(0);
      return;
    }
    
    // Always animate from 0 to current progress
    const initialDelay = 100; // Small initial delay
    
    // Create artificial progress points for smoother animation
    const intermediateSteps = [
      { target: Math.min(20, progress), duration: initialDelay + 500 },
      { target: Math.min(40, progress), duration: initialDelay + 1000 },
      { target: Math.min(60, progress), duration: initialDelay + 1500 },
      { target: Math.min(80, progress), duration: initialDelay + 2000 },
      { target: progress, duration: initialDelay + 2500 }
    ];
    
    // Reset to 0 when starting a new scan
    if (progress === 0) {
      setAnimatedProgress(0);
      return;
    }
    
    // Ensure we have a minimum starting point for visual feedback
    if (animatedProgress === 0 && progress > 0) {
      setAnimatedProgress(5); // Start at 5% for immediate visual feedback
    }
    
    // Animate through each step
    intermediateSteps.forEach(({ target, duration }) => {
      if (target > animatedProgress) {
        setTimeout(() => {
          setAnimatedProgress(prev => {
            // Smoother increment calculation
            const increment = Math.max((target - prev) / 8, 1);
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
