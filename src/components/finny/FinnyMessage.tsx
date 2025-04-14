
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

interface FinnyMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const FinnyMessage = ({ content, isUser, timestamp }: FinnyMessageProps) => {
  // Replace action markers with their visual representation
  const formattedContent = content.replace(/\[ACTION:(.*?)\]/g, '');

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0">
        <Avatar className={`w-8 h-8 ${isUser ? 'bg-primary' : 'bg-secondary'}`}>
          <span className="text-xs font-semibold">
            {isUser ? 'You' : 'F'}
          </span>
        </Avatar>
      </div>
      <div
        className={`px-4 py-3 rounded-2xl max-w-[85%] sm:max-w-[70%] ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-none'
            : 'bg-muted rounded-tl-none'
        }`}
      >
        <div className="text-sm whitespace-pre-wrap break-words">{formattedContent}</div>
        <div className="text-[10px] opacity-70 mt-1 text-right">
          {formatTime(timestamp)}
        </div>
      </div>
    </motion.div>
  );
};

// Format time to a readable format
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default FinnyMessage;
