
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ScanProgressProps {
  isScanning: boolean;
  progress: number;
  statusMessage?: string;
}

export function ScanProgress({ isScanning, progress, statusMessage }: ScanProgressProps) {
  if (!isScanning) return null;
  
  // Determine progress color based on stage
  const getProgressColor = () => {
    if (progress < 30) return "bg-amber-500"; // Initial stages
    if (progress < 70) return "bg-blue-500";  // Middle stages
    return "bg-green-500";                    // Final stages
  };
  
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>{statusMessage || "Processing receipt..."}</span>
        <span className="ml-auto font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress 
        value={progress} 
        className="w-full"
        indicatorClassName={getProgressColor()}
      />
    </div>
  );
}
