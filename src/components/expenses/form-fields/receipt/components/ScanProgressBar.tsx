import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { getProgressColor } from "../utils/progressColors";

interface ScanProgressBarProps {
  isScanning: boolean;
  processingComplete: boolean;
}

export function ScanProgressBar({ isScanning, processingComplete }: ScanProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset progress when not scanning
    if (!isScanning) {
      setProgress(0);
      return;
    }

    // Start timer-based animation when scanning begins
    let animationFrame: number;
    let lastTimestamp = Date.now();
    const MAX_PROGRESS = 95; // Only go up to 95% until backend indicates completion

    const animate = () => {
      const now = Date.now();
      const delta = now - lastTimestamp;
      lastTimestamp = now;

      // Different speed factors for different progress ranges
      // This creates a natural-feeling "slowing down" effect as progress increases
      let speedFactor;
      if (progress < 30) speedFactor = 0.012; // Start faster
      else if (progress < 60) speedFactor = 0.008; // Medium speed
      else if (progress < 80) speedFactor = 0.004; // Slower
      else speedFactor = 0.002; // Very slow near the end

      setProgress((prev) => {
        // Jump to 100% on completion signal
        if (processingComplete) return 100;
        
        // Otherwise increase gradually but never exceed MAX_PROGRESS
        if (prev >= MAX_PROGRESS) return prev;
        
        const increment = speedFactor * delta;
        return Math.min(prev + increment, MAX_PROGRESS);
      });

      if (!processingComplete) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    // Cleanup animation on unmount or when scanning stops
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isScanning, processingComplete]);

  // Get color based on current progress
  const indicatorClassName = getProgressColor(progress);

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
          indicatorClassName={indicatorClassName}
        />
        
        {/* Optional: Add percentage display */}
        <div className="flex justify-between text-xs mt-1 text-muted-foreground">
          <span>0%</span>
          <span className="font-medium">{Math.round(progress)}%</span>
          <span>100%</span>
        </div>
      </motion.div>
    </div>
  );
}
