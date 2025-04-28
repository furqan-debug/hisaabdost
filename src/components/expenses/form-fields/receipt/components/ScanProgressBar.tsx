
import React, { useEffect, useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface ScanProgressBarProps {
  progress: number;
  isScanning?: boolean;
}

export function ScanProgressBar({ progress, isScanning = true }: ScanProgressBarProps) {
  // Track the actual displayed progress value
  const [displayProgress, setDisplayProgress] = useState(0);
  // Track real target progress from props
  const targetProgressRef = useRef(0);
  // Track our animation interval
  const animationRef = useRef<number | null>(null);
  
  // When scanning starts/stops
  useEffect(() => {
    // Reset everything when scanning stops
    if (!isScanning) {
      setDisplayProgress(0);
      targetProgressRef.current = 0;
      
      // Cancel any running animations
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      // When scanning starts, begin at 0
      setDisplayProgress(0);
      // Schedule a small jump to 3% for immediate visual feedback
      // But use a timeout to ensure it visibly starts from 0
      setTimeout(() => {
        if (isScanning) {
          setDisplayProgress(3);
        }
      }, 100);
    }
    
    return () => {
      // Clean up any animations when component unmounts
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isScanning]);
  
  // Handle progress updates - update our target but animate to it
  useEffect(() => {
    // Update the target we want to animate to
    targetProgressRef.current = progress;
    
    // Don't animate if we're not scanning
    if (!isScanning) return;
    
    // Start our custom animation loop if not already running
    if (animationRef.current === null && progress > displayProgress) {
      const animateProgress = () => {
        setDisplayProgress(prev => {
          // If we're very close to target or past it, just set to target
          if (Math.abs(targetProgressRef.current - prev) < 0.5) {
            return targetProgressRef.current;
          }
          
          // Calculate increment based on gap - faster when gap is larger
          const gap = targetProgressRef.current - prev;
          const increment = Math.max(gap * 0.07, 0.3); // At least 0.3% increase
          const newValue = Math.min(prev + increment, targetProgressRef.current);
          
          // If we haven't reached target yet, continue animation
          if (newValue < targetProgressRef.current) {
            animationRef.current = requestAnimationFrame(animateProgress);
          }
          
          return newValue;
        });
      };
      
      // Start the animation
      animationRef.current = requestAnimationFrame(animateProgress);
    }
    
    // Clean up animation when dependencies change
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [progress, isScanning, displayProgress]);
  
  // Get the appropriate color class based on the progress value
  const getIndicatorClassName = () => {
    if (displayProgress < 30) return 'bg-amber-500';
    if (displayProgress < 70) return 'bg-blue-500';
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
          value={displayProgress} 
          className="h-2 bg-secondary"
          indicatorClassName={getIndicatorClassName()}
        />
      </motion.div>
    </div>
  );
}
