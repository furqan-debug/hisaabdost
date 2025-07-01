
import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessagesArea } from './MessagesArea';
import ChatInput from '../ChatInput';
import QuickReplies from '../QuickReplies';
import { AdvancedInsightsPanel } from './AdvancedInsightsPanel';
import { Message, QuickReply } from '../types';

interface ChatContainerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  oldestMessageTime: Date | null;
  isConnectingToData: boolean;
  filteredMessages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  quickReplies: QuickReply[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (e?: React.FormEvent, quickAction?: string) => void;
  handleQuickReply: (reply: QuickReply) => void;
  resetChat: () => void;
  isAuthPromptOnly: boolean;
  insights?: {
    savingsRate: string;
    topSpendingCategory: string;
    monthlySpending: number;
    financialHealthScore: string;
  };
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  isOpen,
  onClose,
  user,
  oldestMessageTime,
  isConnectingToData,
  filteredMessages,
  isTyping,
  isLoading,
  quickReplies,
  messagesEndRef,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleQuickReply,
  resetChat,
  isAuthPromptOnly,
  insights
}) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && chatRef.current) {
      chatRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/30 backdrop-blur-md z-50 flex items-end justify-center p-4 md:items-center"
        onClick={onClose}
      >
        <motion.div
          ref={chatRef}
          initial={{ y: "100%", opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: "100%", opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          className="w-full max-w-md max-h-[85vh] md:max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="flex flex-col h-full border-0 shadow-2xl bg-gradient-to-b from-white via-white to-gray-50/80 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/80 backdrop-blur-xl overflow-hidden">
            {/* Enhanced Header with Gradient */}
            <div className="relative p-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl transform -translate-x-16 -translate-y-16 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full blur-2xl transform translate-x-12 translate-y-12 animate-pulse delay-1000"></div>
              </div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Finny</h3>
                    <p className="text-xs text-white/80 font-medium">Advanced AI Financial Assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetChat}
                      className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Advanced Insights Panel */}
            <div className="px-4 pt-4">
              <AdvancedInsightsPanel 
                insights={insights}
                isVisible={user && !isAuthPromptOnly && filteredMessages.length > 1}
              />
            </div>

            {/* Messages Area with Better Styling */}
            <div className="flex-1 relative">
              <MessagesArea
                user={user}
                oldestMessageTime={oldestMessageTime}
                isConnectingToData={isConnectingToData}
                filteredMessages={filteredMessages}
                isTyping={isTyping}
                isLoading={isLoading}
                quickReplies={quickReplies}
                messagesEndRef={messagesEndRef}
                scrollAreaRef={scrollAreaRef}
                isAuthPromptOnly={isAuthPromptOnly}
                handleQuickReply={handleQuickReply}
              />
            </div>

            {/* Enhanced Input Area */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-t border-gray-200/50 dark:border-gray-700/50">
              <ChatInput
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onSubmit={handleSendMessage}
                disabled={isLoading}
                isLoading={isLoading}
                isAuthenticated={!!user}
                isConnecting={isConnectingToData}
                placeholder={user ? "Ask me anything about your finances... 💰" : "Please log in to chat with Finny"}
              />
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
