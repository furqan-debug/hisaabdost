
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface ScanProgressBarProps {
  progress: number;
  isScanning: boolean;
}

export function ScanProgressBar({ progress, isScanning }: ScanProgressBarProps) {
  if (!isScanning) return null;
  
  // Determine progress color based on stage
  const getProgressColor = () => {
    if (progress < 30) return "bg-amber-500"; // Initial stages
    if (progress < 70) return "bg-blue-500";  // Middle stages
    return "bg-green-500";                   // Final stages
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xs mb-2"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium">{Math.round(progress)}% complete</span>
      </div>
      <Progress 
        value={progress} 
        className="h-2 w-full" 
        indicatorClassName={getProgressColor()}
      />
    </motion.div>
  );
}
