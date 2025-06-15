
import React from 'react';
import { motion } from 'framer-motion';
import MessageAvatar from './components/MessageAvatar';

const TypingIndicator = () => {
  return (
    <motion.div 
      className="flex items-start gap-4 justify-start mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <MessageAvatar isUser={false} timestamp={new Date()} />
      
      <div className="bg-gradient-to-br from-gray-50 to-white text-gray-700 border border-gray-200 rounded-3xl px-6 py-4 shadow-lg backdrop-blur-sm max-w-[200px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <motion.div 
              className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div 
              className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div 
              className="w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Finny is thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
