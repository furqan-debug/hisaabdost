
import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Sparkles } from 'lucide-react';

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
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ 
        type: 'spring', 
        stiffness: 500, 
        damping: 30,
        delay: 0.1
      }}
    >
      {isUser ? (
        <div className="relative">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-white/50 backdrop-blur-sm">
            <User size={18} className="text-white" />
          </div>
          
          {/* Decorative sparkle for user */}
          <motion.div 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-sm"
            animate={{ rotate: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={8} className="text-white" />
          </motion.div>
        </div>
      ) : (
        <div className="relative">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 flex items-center justify-center shadow-lg ring-2 ring-white/50 backdrop-blur-sm">
            <Bot size={18} className="text-white" />
          </div>
          
          {/* AI thinking indicator */}
          {isRecent && (
            <motion.div 
              className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </motion.div>
          )}
          
          {/* Floating particles effect */}
          <motion.div 
            className="absolute inset-0 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          >
            <div className="absolute top-1 left-2 w-1 h-1 bg-cyan-300 rounded-full opacity-60" />
            <div className="absolute bottom-2 right-1 w-1 h-1 bg-emerald-300 rounded-full opacity-40" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
});

MessageAvatar.displayName = 'MessageAvatar';

export default MessageAvatar;
