
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface MessageAvatarProps {
  isUser: boolean;
  timestamp: Date;
}

const MessageAvatar = React.memo(({ isUser }: MessageAvatarProps) => {
  return (
    <motion.div 
      className="flex-shrink-0"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 500, 
        damping: 30,
        delay: 0.1
      }}
    >
      {isUser ? (
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-1 ring-white/10">
          <User size={16} className="sm:w-5 sm:h-5 text-white" />
        </div>
      ) : (
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-700 flex items-center justify-center shadow-lg ring-1 ring-white/10">
          <Bot size={16} className="sm:w-5 sm:h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
});

MessageAvatar.displayName = 'MessageAvatar';

export default MessageAvatar;
