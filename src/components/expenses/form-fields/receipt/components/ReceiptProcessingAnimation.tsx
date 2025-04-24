
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ReceiptProcessingAnimationProps {
  progress: number;
  message?: string;
}

export function ReceiptProcessingAnimation({ progress, message }: ReceiptProcessingAnimationProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[1px]">
      {/* Animated scan line */}
      <div className="animate-scan-line absolute inset-0 pointer-events-none" />
      
      {/* Pulsing border */}
      <motion.div
        className="absolute inset-0 border-2 border-primary/50 rounded-lg"
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [0.98, 1, 0.98],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Progress indicator */}
      <div className="w-full max-w-xs space-y-4 z-10">
        <Progress 
          value={progress} 
          className="h-2 w-full bg-secondary/30"
          indicatorClassName="bg-gradient-to-r from-primary/60 to-primary"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <p className="text-sm font-medium text-foreground/80">
            {message || "Processing receipt..."}
          </p>
          <p className="text-xs text-muted-foreground">
            {progress}% complete
          </p>
        </motion.div>
      </div>
      
      {/* Background gradient effect */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-background/80 to-transparent",
          "pointer-events-none animate-shimmer"
        )}
      />
    </div>
  );
}
