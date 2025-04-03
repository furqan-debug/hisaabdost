
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, FileText, FileCheck, Database, ReceiptText } from 'lucide-react';

interface ScanStatusProps {
  message?: string;
  progress: number;
  isScanning: boolean;
}

export function ScanStatus({ message, progress, isScanning }: ScanStatusProps) {
  const stages = [
    { threshold: 20, message: 'Analyzing receipt...', icon: <FileText className="h-4 w-4" /> },
    { threshold: 40, message: 'Extracting text...', icon: <ReceiptText className="h-4 w-4" /> },
    { threshold: 60, message: 'Processing data...', icon: <Cpu className="h-4 w-4" /> },
    { threshold: 80, message: 'Identifying items...', icon: <FileCheck className="h-4 w-4" /> },
    { threshold: 100, message: 'Saving to database...', icon: <Database className="h-4 w-4" /> },
  ];

  // Find current stage based on progress
  const currentStage = stages.find(stage => progress <= stage.threshold) || stages[0];

  // If a specific message is provided, use it instead
  const statusMessage = message || currentStage.message;
  
  // Get current stage index
  const currentStageIndex = stages.findIndex(stage => stage === currentStage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-3 text-sm text-center w-full max-w-[300px] flex flex-col items-center"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={statusMessage}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border shadow-sm"
        >
          <motion.div 
            animate={{ rotate: isScanning ? 360 : 0 }}
            transition={{ duration: 2, repeat: isScanning ? Infinity : 0, ease: "linear" }}
            className="text-primary"
          >
            {currentStage.icon}
          </motion.div>
          <p className="text-sm font-medium">{statusMessage}</p>
        </motion.div>
      </AnimatePresence>
      
      {/* Stage indicators */}
      <div className="flex mt-3 gap-1">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.threshold}
            className={`h-1.5 w-1.5 rounded-full ${
              index <= currentStageIndex ? 'bg-primary' : 'bg-muted'
            }`}
            animate={index <= currentStageIndex ? {
              scale: [1, 1.2, 1],
            } : {}}
            transition={{
              duration: 1.5,
              repeat: isScanning ? Infinity : 0,
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
      
      {progress > 0 && progress < 100 && (
        <p className="text-xs mt-1 text-muted-foreground">
          {Math.round(progress)}% complete
        </p>
      )}
    </motion.div>
  );
}
