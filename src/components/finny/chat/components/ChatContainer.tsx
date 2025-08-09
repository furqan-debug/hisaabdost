import React, { useEffect, useRef, useState } from 'react';
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
  // ... other props
  ...props 
}) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [dynamicHeight, setDynamicHeight] = useState<number | string>('100%');

  // --- NEW, ROBUST KEYBOARD HANDLING LOGIC ---
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (window.visualViewport) {
        // Set the height of the container to the exact visible height
        setDynamicHeight(window.visualViewport.height);
      }
    };

    // Set initial height
    handleResize();

    // Add listener for when keyboard opens/closes or other resize events
    const visualViewport = window.visualViewport;
    visualViewport?.addEventListener('resize', handleResize);

    // Cleanup function to remove the listener
    return () => {
      visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);
  // --- END OF NEW LOGIC ---

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          ref={chatRef}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 250 }}
          className="w-full max-w-md flex flex-col bg-white dark:bg-gray-900 md:rounded-lg md:max-h-[85vh] md:mb-4"
          // The height is now controlled by our new logic
          style={{ height: typeof dynamicHeight === 'number' ? `${dynamicHeight}px` : dynamicHeight }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="flex flex-col flex-1 h-full border-0 shadow-none bg-transparent overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
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
                      onClick={props.resetChat}
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

            {/* Messages Area */}
            <div className="flex-1 relative overflow-hidden">
              <MessagesArea
                user={user}
                oldestMessageTime={props.oldestMessageTime}
                isConnectingToData={props.isConnectingToData}
                filteredMessages={props.filteredMessages}
                isTyping={props.isTyping}
                isLoading={props.isLoading}
                quickReplies={props.quickReplies}
                messagesEndRef={props.messagesEndRef}
                scrollAreaRef={scrollAreaRef}
                isAuthPromptOnly={props.isAuthPromptOnly}
                handleQuickReply={props.handleQuickReply}
              />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0">
              <ChatInput
                value={props.newMessage}
                onChange={(e) => props.setNewMessage(e.target.value)}
                onSubmit={props.handleSendMessage}
                disabled={props.isLoading}
                isLoading={props.isLoading}
                isAuthenticated={!!user}
                isConnecting={props.isConnectingToData}
                placeholder={user ? "Ask me anything..." : "Please log in to chat"}
              />
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};