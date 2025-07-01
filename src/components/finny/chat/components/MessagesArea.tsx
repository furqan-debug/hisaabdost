
import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatHistoryBanner } from '../ChatHistoryBanner';
import { FinnyMessage } from '../FinnyMessage';
import TypingIndicator from '../TypingIndicator';
import QuickReplies from '../QuickReplies';
import { AuthAlert } from './AuthAlert';
import { Message, QuickReply } from '../types';

interface MessagesAreaProps {
  user: any;
  oldestMessageTime?: Date;
  isConnectingToData: boolean;
  filteredMessages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  quickReplies: QuickReply[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  isAuthPromptOnly: boolean;
  handleQuickReply: (reply: QuickReply) => void;
}

export const MessagesArea = ({
  user,
  oldestMessageTime,
  isConnectingToData,
  filteredMessages,
  isTyping,
  isLoading,
  quickReplies,
  messagesEndRef,
  scrollAreaRef,
  isAuthPromptOnly,
  handleQuickReply
}: MessagesAreaProps) => {
  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full custom-scrollbar touch-scroll-container" ref={scrollAreaRef}>
        <div className="finny-messages-container">
          <AuthAlert user={user} isAuthPromptOnly={isAuthPromptOnly} />

          {user && oldestMessageTime && <ChatHistoryBanner oldestMessageTime={oldestMessageTime} />}
          
          {isConnectingToData && user && (
            <motion.div 
              className="flex flex-col items-center justify-center py-8 space-y-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin">
                  <div className="w-3 h-3 bg-primary rounded-full absolute -top-1.5 left-1/2 transform -translate-x-1/2"></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-white mb-1">Connecting to Finny</div>
                <div className="text-xs text-gray-400">Analyzing your financial data...</div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {filteredMessages.map((message, index) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <FinnyMessage 
                  message={message}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
        
          {!isLoading && !isTyping && filteredMessages.length > 0 && !filteredMessages[filteredMessages.length - 1].isUser && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <QuickReplies 
                replies={quickReplies} 
                onSelect={handleQuickReply} 
                isLoading={isLoading} 
                isAuthenticated={!!user} 
              />
            </motion.div>
          )}
        
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
