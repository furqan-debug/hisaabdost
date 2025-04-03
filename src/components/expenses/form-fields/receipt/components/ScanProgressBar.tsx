
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface ScanProgressBarProps {
  progress: number;
  isScanning?: boolean;
}

export function ScanProgressBar({ progress, isScanning = true }: ScanProgressBarProps) {
  // Get the appropriate color class based on the progress value
  const getIndicatorClassName = () => {
    if (progress < 30) return 'bg-amber-500';
    if (progress < 70) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  // Get the status text based on progress
  const getStatusText = () => {
    if (progress < 30) return 'Starting';
    if (progress < 70) return 'Processing';
    if (progress < 100) return 'Finalizing';
    return 'Complete';
  };

  // Get the badge variant based on progress
  const getBadgeVariant = () => {
    if (progress < 30) return 'warning';
    if (progress < 70) return 'info';
    return 'success';
  };

  return (
    <div className="w-full max-w-[300px] px-4">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-3"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-muted-foreground">
            {progress < 100 ? 'Scanning receipt...' : 'Scan complete'}
          </span>
          <Badge variant={getBadgeVariant()} className="text-[10px] py-0">
            {getStatusText()}
          </Badge>
        </div>
        
        <div className="relative">
          <Progress 
            value={progress} 
            className="h-3 bg-secondary/50 rounded-full overflow-hidden"
            indicatorClassName={`${getIndicatorClassName()} transition-all duration-700 ease-out relative`}
          />
          
          {/* Add subtle pulse effect to the progress bar */}
          {isScanning && progress < 100 && (
            <motion.div 
              className="h-3 absolute top-0 left-0 rounded-full bg-white/30"
              style={{ width: `${progress * 0.7}%` }}
              animate={{ 
                opacity: [0, 0.5, 0],
                x: [`${progress * 0.3}%`, `${progress}%`] 
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
          )}
          
          {/* Add scan line animation */}
          {isScanning && progress < 100 && (
            <motion.div 
              className="absolute top-0 bottom-0 w-1 bg-white/80"
              style={{ left: `${progress}%` }}
              animate={{ 
                opacity: [0.7, 0.9, 0.7],
                boxShadow: [
                  '0 0 2px rgba(255,255,255,0.5)',
                  '0 0 5px rgba(255,255,255,0.8)',
                  '0 0 2px rgba(255,255,255,0.5)'
                ]
              }}
              transition={{ 
                duration: 1.0, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          )}
        </div>
        
        {/* Progress percentage */}
        <div className="text-right">
          <span className="text-xs font-medium text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      </motion.div>
    </div>
  );
}
