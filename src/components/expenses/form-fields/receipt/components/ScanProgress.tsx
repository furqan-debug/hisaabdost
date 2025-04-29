import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface ScanProgressBarProps {
  progress: number;       // Backend scan progress (raw)
  processingComplete: boolean; // New prop to detect true finish
  isScanning?: boolean;
}

export function ScanProgressBar({ progress, processingComplete, isScanning = true }: ScanProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setAnimatedProgress((prev) => {
        // 1. If real backend says processing is complete, jump to 100%
        if (processingComplete) return 100;

        // 2. If backend gives a certain progress (e.g., 30%, 50%), sync towards it
        if (progress > prev && progress < 90) {
          return Math.min(prev + 1, progress);
        }

        // 3. Otherwise, animate slowly toward 85% maximum
        if (prev < 85) {
          return prev + 1;
        }

        // 4. Stop incrementing if we reached fake cap
        return prev;
      });
    }, 50); // every 50ms → smooth visual

    return () => clearInterval(interval);
  }, [progress, processingComplete, isScanning]);

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
