
import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <motion.div 
      className="flex justify-start mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-gray-800 text-gray-100 border border-gray-600 rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
          <div className="text-xs text-gray-300">
            Finny is typing...
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
