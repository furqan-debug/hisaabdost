
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Message } from './types';
import { MessageTimestamp } from './components/MessageTimestamp';
import { ActionIndicator } from './components/ActionIndicator';

interface FinnyMessageProps {
  message: Message;
  isLatest?: boolean;
}

export const FinnyMessage: React.FC<FinnyMessageProps> = ({ message, isLatest = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!message.isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      
      <div className={`max-w-[80%] ${message.isUser ? 'order-first' : ''}`}>
        <Card className={`
          p-3 shadow-lg border-0 relative overflow-hidden
          ${message.isUser 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ml-auto' 
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
          }
        `}>
          {/* Subtle background pattern for AI messages */}
          {!message.isUser && (
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
            </div>
          )}
          
          <div className="relative">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
            
            {message.hasAction && (
              <div className="mt-2">
                <ActionIndicator />
              </div>
            )}
          </div>
        </Card>
        
        <div className={`flex items-center gap-2 mt-1 px-1 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
          <MessageTimestamp timestamp={message.timestamp} />
        </div>
      </div>
      
      {message.isUser && (
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600">
            <AvatarFallback className="bg-transparent">
              <User className="w-4 h-4 text-white" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </motion.div>
  );
};
