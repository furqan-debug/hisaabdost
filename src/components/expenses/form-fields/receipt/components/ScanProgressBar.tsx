
import React, { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface ScanProgressBarProps {
  isScanning: boolean;
  processingComplete: boolean;
  progress: number;
}

export function ScanProgressBar({ isScanning, processingComplete, progress }: ScanProgressBarProps) {
  // Memoize color calculation to avoid recalculating on every render
  const indicatorClassName = useMemo(() => {
    if (progress >= 90) return "bg-green-500";
    if (progress >= 70) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-orange-500";
  }, [progress]);

  // Only animate when actually needed
  if (!isScanning && !processingComplete) {
    return null;
  }

  return (
    <div className="w-full max-w-[300px] px-4">
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Progress 
          value={progress} 
          className="h-2 bg-secondary" 
          indicatorClassName={indicatorClassName}
        />
        
        <div className="flex justify-between text-xs mt-1 text-muted-foreground">
          <span>0%</span>
          <span className="font-medium">{Math.round(progress)}%</span>
          <span>100%</span>
        </div>
      </motion.div>
    </div>
  );
}
