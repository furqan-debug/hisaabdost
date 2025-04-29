import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface ScanProgressBarProps {
  isScanning: boolean;
  processingComplete: boolean;
}

export function ScanProgressBar({ isScanning, processingComplete }: ScanProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (processingComplete) return 100;
        if (prev >= 90) return prev; // Hold at 90% maximum until real complete
        return prev + 1; // Smooth +1 every interval
      });
    }, 50); // 50ms for very smooth feeling

    return () => clearInterval(interval);
  }, [isScanning, processingComplete]);

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
      >
        <Progress 
          value={progress} 
          className="h-2 bg-secondary" 
          indicatorClassName={getIndicatorClassName()}
        />
      </motion.div>
    </div>
  );
}
