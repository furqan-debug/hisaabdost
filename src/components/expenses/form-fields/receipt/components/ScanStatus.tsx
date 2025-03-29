
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ScanStatusProps {
  message?: string;
  progress: number;
  isScanning: boolean;
}

export function ScanStatus({ message, progress, isScanning }: ScanStatusProps) {
  if (!isScanning) return null;
  
  // Custom status messages for different progress stages
  const getDefaultMessage = () => {
    if (progress < 20) return "Preparing to process receipt...";
    if (progress < 50) return "Analyzing receipt contents...";
    if (progress < 75) return "Extracting expense items...";
    if (progress < 95) return "Adding items to your expenses...";
    return "Almost done...";
  };
  
  const displayMessage = message || getDefaultMessage();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 text-center p-2"
    >
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span className="text-sm text-foreground/80">{displayMessage}</span>
    </motion.div>
  );
}
