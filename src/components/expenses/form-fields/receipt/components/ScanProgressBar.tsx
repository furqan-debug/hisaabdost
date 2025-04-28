
import React, { useEffect, useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface ScanProgressBarProps {
  progress: number;
  isScanning?: boolean;
}

export function ScanProgressBar({ progress, isScanning = true }: ScanProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetProgressRef = useRef(0);
  
  // Reset animation when scanning stops
  useEffect(() => {
    if (!isScanning) {
      // Clear any running animation intervals
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      // Reset progress to 0
      setAnimatedProgress(0);
      targetProgressRef.current = 0;
      return;
    }
  }, [isScanning]);

  // Animate progress smoothly
  useEffect(() => {
    // Set the target progress reference
    targetProgressRef.current = progress;
    
    // Start from 0 if this is the beginning of a new scan
    if (progress > 0 && animatedProgress === 0) {
      // Always start with a small amount of progress for immediate feedback
      setAnimatedProgress(3);
    }
    
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Only set up animation if we're scanning and progress needs to increase
    if (isScanning && progress > animatedProgress) {
      // Create a smooth animation that updates frequently
      progressIntervalRef.current = setInterval(() => {
        setAnimatedProgress(prev => {
          // If we're close to target, just set it directly
          if (targetProgressRef.current - prev < 1) {
            clearInterval(progressIntervalRef.current!);
            return targetProgressRef.current;
          }
          
          // Calculate a smooth increment that speeds up based on the gap
          const gap = targetProgressRef.current - prev;
          const increment = Math.max(gap * 0.05, 0.5); // At least 0.5% increase each time
          
          // Cap the progress at the target
          return Math.min(prev + increment, targetProgressRef.current);
        });
      }, 50); // Update every 50ms for smooth animation
    }
    
    // Clean up interval on component unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
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
