
import React from 'react';
import { motion } from 'framer-motion';

interface MessageAvatarProps {
  isUser: boolean;
  timestamp: Date;
}

const MessageAvatar = React.memo(({ isUser, timestamp }: MessageAvatarProps) => {
  const isRecent = Date.now() - timestamp.getTime() < 5000; // Less than 5 seconds ago

  return (
    <motion.div 
      className="flex-shrink-0"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {isUser ? (
        <div className="user-avatar">
          <span>U</span>
        </div>
      ) : (
        <div className="finny-avatar relative">
          <span>F</span>
          {isRecent && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-ping"></div>
          )}
        </div>
      )}
    </motion.div>
  );
});

MessageAvatar.displayName = 'MessageAvatar';

export default MessageAvatar;
