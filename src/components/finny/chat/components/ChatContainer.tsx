
import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessagesArea } from './MessagesArea';
import ChatInput from '../ChatInput';
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

  // Handle Android status bar and keyboard issues
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('finny-chat-open');
      // Prevent body scroll when chat is open on mobile
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('finny-chat-open');
      document.body.style.overflow = '';
    }

    return () => {
      document.body.classList.remove('finny-chat-open');
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end justify-center p-0 md:p-4 md:items-center"
        onClick={onClose}
      >
        <motion.div
          ref={chatRef}
          initial={{ y: "100%", opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: "100%", opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md h-full md:h-auto md:max-h-[80vh] flex flex-col finny-chat-mobile-fix"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="flex flex-col h-full border shadow-2xl bg-white dark:bg-gray-900 overflow-hidden rounded-none md:rounded-lg">
            {/* Header with Android status bar padding */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 safe-area-top">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Finny</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Financial Assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetChat}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area - flexible height */}
            <div className="flex-1 relative finny-messages-mobile">
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

            {/* Input Area - sticky at bottom with safe area */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 finny-input-mobile safe-area-bottom">
              <ChatInput
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onSubmit={handleSendMessage}
                disabled={isLoading}
                isLoading={isLoading}
                isAuthenticated={!!user}
                isConnecting={isConnectingToData}
                placeholder={user ? "Ask me anything..." : "Please log in to chat"}
              />
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
