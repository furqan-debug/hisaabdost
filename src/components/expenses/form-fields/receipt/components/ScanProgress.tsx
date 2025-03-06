
import { Progress } from "@/components/ui/progress";

interface ScanProgressProps {
  isScanning: boolean;
  progress: number;
}

export function ScanProgress({ isScanning, progress }: ScanProgressProps) {
  if (!isScanning) return null;
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span>Scanning receipt...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );
}
