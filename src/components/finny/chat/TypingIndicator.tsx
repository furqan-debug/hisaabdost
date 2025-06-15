
import React from 'react';
import { motion } from 'framer-motion';
import MessageAvatar from './components/MessageAvatar';

const TypingIndicator = () => {
  return (
    <motion.div 
      className="flex items-start gap-3 sm:gap-4 justify-start mb-6 px-2 sm:px-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <MessageAvatar isUser={false} timestamp={new Date()} />
      
      <div className="bg-white rounded-2xl sm:rounded-3xl px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <motion.div 
              className="typing-dot"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
            />
            <motion.div 
              className="typing-dot"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
            <motion.div 
              className="typing-dot"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
