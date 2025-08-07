
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Message } from './types';
import MessageTimestamp from './components/MessageTimestamp';
import ActionIndicator from './components/ActionIndicator';

interface FinnyMessageProps {
  message: Message;
  isLatest?: boolean;
}

export const FinnyMessage: React.FC<FinnyMessageProps> = ({ message, isLatest = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!message.isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      
      <div className={`max-w-[80%] ${message.isUser ? 'order-first' : ''}`}>
        <Card className={`
          p-3 border shadow-sm
          ${message.isUser 
            ? 'bg-blue-500 text-white border-blue-500' 
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700'
          }
        `}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          
          {message.hasAction && (
            <div className="mt-2">
              <ActionIndicator 
                hasAction={message.hasAction}
                isSuccess={false}
                isError={false}
              />
            </div>
          )}
        </Card>
        
        <div className={`flex items-center gap-2 mt-1 px-1 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
          <MessageTimestamp timestamp={message.timestamp} />
        </div>
      </div>
      
      {message.isUser && (
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8 bg-blue-500">
            <AvatarFallback className="bg-transparent">
              <User className="w-4 h-4 text-white" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </motion.div>
  );
};

export default FinnyMessage;
