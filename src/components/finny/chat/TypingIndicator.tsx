
import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 items-start px-4 py-2">
      <div className="w-8 h-8 rounded-full bg-[#9b87f5] flex items-center justify-center">
        <span className="text-xs font-semibold text-white">F</span>
      </div>
      <div className="bg-[#1A1F2C] rounded-2xl px-4 py-3 max-w-[85%]">
        <div className="flex items-center gap-3">
          <motion.div
            className="h-0.5 w-5 bg-white/50 rounded-full"
            animate={{
              width: [5, 20, 5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
