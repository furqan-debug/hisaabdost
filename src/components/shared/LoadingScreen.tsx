
import React from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center p-4"
      >
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3"></div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </motion.div>
    </div>
  );
};
