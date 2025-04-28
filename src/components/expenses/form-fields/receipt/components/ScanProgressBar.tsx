
import React, { useEffect, useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface ScanProgressBarProps {
  progress: number;  // Backend progress
  isScanning?: boolean;
}

export function ScanProgressBar({ progress, isScanning = true }: ScanProgressBarProps) {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const animationFrameRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);
  
  useEffect(() => {
    if (!isScanning) {
      // Reset progress when scanning stops
      setDisplayedProgress(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Start from 0
    setDisplayedProgress(0);
    lastUpdateTime.current = performance.now();

    // Animate progress
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastUpdateTime.current;
      lastUpdateTime.current = currentTime;

      setDisplayedProgress(prevProgress => {
        // If backend reports 100%, jump to complete
        if (progress >= 100) {
          return 100;
        }

        // Calculate new progress
        let newProgress = prevProgress;
        
        // Different speeds for different progress ranges
        if (prevProgress < 30) {
          // Fast initial progress (0-30%)
          newProgress += (deltaTime * 0.05); // 5% per second
        } else if (prevProgress < 60) {
          // Medium speed (30-60%)
          newProgress += (deltaTime * 0.03); // 3% per second
        } else if (prevProgress < 80) {
          // Slower as we approach 80%
          newProgress += (deltaTime * 0.015); // 1.5% per second
        }
        
        // Cap at 80% unless backend reports completion
        return Math.min(newProgress, progress >= 100 ? 100 : 80);
      });

      // Continue animation unless we've reached 100%
      if (displayedProgress < 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning, progress]);

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
