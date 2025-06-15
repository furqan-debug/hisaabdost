
import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <motion.div 
      className="flex gap-3 items-start px-4 py-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="finny-avatar">
        <span>F</span>
      </div>
      
      <div className="typing-indicator">
        <div className="flex items-center gap-1">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Finny is typing...
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
