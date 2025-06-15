
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface MessageAvatarProps {
  isUser: boolean;
  timestamp: Date;
}

const MessageAvatar = React.memo(({ isUser, timestamp }: MessageAvatarProps) => {
  const isRecent = Date.now() - timestamp.getTime() < 5000; // Less than 5 seconds ago

  return (
    <motion.div 
      className="flex-shrink-0"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 500, 
        damping: 30,
        delay: 0.1
      }}
    >
      {isUser ? (
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md border-2 border-white">
            <User size={14} className="text-white" />
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-md border-2 border-white">
            <Bot size={14} className="text-white" />
          </div>
          {isRecent && (
            <motion.div 
              className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
      )}
    </motion.div>
  );
});

MessageAvatar.displayName = 'MessageAvatar';

export default MessageAvatar;
