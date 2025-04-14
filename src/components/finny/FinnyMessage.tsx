
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

interface FinnyMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const FinnyMessage = ({ content, isUser, timestamp }: FinnyMessageProps) => {
  const formattedContent = content.replace(/\[ACTION:(.*?)\]/g, '');

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Avatar className={`w-8 h-8 ${isUser ? 'bg-primary' : 'bg-muted'}`}>
        <span className="text-xs font-semibold">
          {isUser ? 'You' : 'F'}
        </span>
      </Avatar>
      
      <div className={isUser ? 'finny-message-user' : 'finny-message-bot'}>
        <div className="text-sm whitespace-pre-wrap break-words">
          {formattedContent}
        </div>
        <div className="finny-message-time">
          {formatTime(timestamp)}
        </div>
      </div>
    </motion.div>
  );
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

export default FinnyMessage;
