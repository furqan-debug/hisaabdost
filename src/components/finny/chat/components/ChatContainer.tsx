
import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { QuickRepliesGrid } from './QuickRepliesGrid';
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
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end justify-center p-4 md:items-center"
        onClick={onClose}
      >
        <motion.div
          ref={chatRef}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 500 }}
          className="w-full max-w-md max-h-[85vh] md:max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="flex flex-col h-full border-primary/20 shadow-2xl bg-background/95 backdrop-blur-md">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Finny</h3>
                  <p className="text-xs text-muted-foreground">Advanced AI Financial Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetChat}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Advanced Insights Panel */}
            <div className="px-4 pt-4">
              <AdvancedInsightsPanel 
                insights={insights}
                isVisible={user && !isAuthPromptOnly && filteredMessages.length > 1}
              />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageList
                messages={filteredMessages}
                isTyping={isTyping}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
                oldestMessageTime={oldestMessageTime}
                isConnectingToData={isConnectingToData}
              />
            </div>

            {/* Quick Replies */}
            {user && !isAuthPromptOnly && quickReplies.length > 0 && (
              <div className="px-4 py-2 border-t border-border/50">
                <QuickRepliesGrid
                  quickReplies={quickReplies}
                  onQuickReply={handleQuickReply}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border/50 bg-background/50">
              <ChatInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
                isLoading={isLoading}
                user={user}
                placeholder={user ? "Ask me anything about your finances... 💰" : "Please log in to chat with Finny"}
              />
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
