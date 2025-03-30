
import React from "react";
import { Check, CircleAlert, FileText, Loader } from "lucide-react";
import { ScanProgressBar } from "./ScanProgressBar";
import { motion, AnimatePresence } from "framer-motion";

interface ScanProgressProps {
  status: "idle" | "pending" | "success" | "error";
  progress: number;
  message: string;
  errorMessage?: string;
}

export function ScanProgress({
  status,
  progress,
  message,
  errorMessage,
}: ScanProgressProps) {
  return (
    <motion.div 
      className="mb-4 border rounded-lg p-4 bg-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-center mb-3">
        <AnimatePresence mode="wait">
          {status === "pending" && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center rounded-full p-2 bg-muted w-12 h-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              >
                <Loader className="h-6 w-6 text-primary" />
              </motion.div>
            </motion.div>
          )}
          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: [0.8, 1.1, 1],
                transition: { duration: 0.5 }
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center rounded-full p-2 bg-green-100 dark:bg-green-900/20 w-12 h-12"
            >
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </motion.div>
          )}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center rounded-full p-2 bg-destructive/10 w-12 h-12"
            >
              <CircleAlert className="h-6 w-6 text-destructive" />
            </motion.div>
          )}
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center rounded-full p-2 bg-muted w-12 h-12"
            >
              <FileText className="h-6 w-6 text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <p className="text-center text-sm font-medium">{message}</p>
        
        {status === "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ScanProgressBar progress={progress} />
          </motion.div>
        )}

        {status === "error" && errorMessage && (
          <motion.p 
            className="text-center text-xs text-destructive mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {errorMessage}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
