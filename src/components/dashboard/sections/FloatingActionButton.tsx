
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onAddExpense: () => void;
  className?: string;
}

export function FloatingActionButton({ onAddExpense, className = "" }: FloatingActionButtonProps) {
  return (
    <motion.div
      className={`fixed bottom-24 right-6 z-30 ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.5 
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        onClick={onAddExpense}
        size="lg"
        className="w-16 h-16 rounded-full shadow-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:to-primary border-0 group relative overflow-hidden"
      >
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/50 to-transparent rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Icons with transition */}
        <motion.div
          className="relative z-10"
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.3 }}
        >
          <Plus className="w-7 h-7 text-white" />
        </motion.div>
        
        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white/20"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      </Button>
    </motion.div>
  );
}
