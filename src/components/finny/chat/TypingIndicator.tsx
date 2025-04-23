
import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 items-start px-4 py-2">
      <div className="w-8 h-8 rounded-full bg-[#9b87f5] flex items-center justify-center">
        <span className="text-xs font-semibold text-white">F</span>
      </div>
      <div className="bg-[#2a2438] rounded-2xl px-4 py-3 max-w-[85%]">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
