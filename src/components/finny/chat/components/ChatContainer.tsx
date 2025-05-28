
import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import ChatHeader from '../ChatHeader';
import ChatInput from '../ChatInput';
import { MessagesArea } from './MessagesArea';
import { usePullToClose } from '../hooks/usePullToClose';
import { Message, QuickReply } from '../types';

interface ChatContainerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  oldestMessageTime?: Date;
  isConnectingToData: boolean;
  filteredMessages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  quickReplies: QuickReply[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  newMessage: string;
  setNewMessage: (value: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  handleQuickReply: (reply: QuickReply) => void;
  resetChat: () => void;
  isAuthPromptOnly: boolean;
}

export const ChatContainer = ({
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
  isAuthPromptOnly
}: ChatContainerProps) => {
  const isMobile = useIsMobile();
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtTop, setIsAtTop] = useState(true);

  // Monitor scroll position to determine if user is at the top
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleScroll = () => {
      const scrollTop = scrollArea.scrollTop;
      setIsAtTop(scrollTop <= 10); // Consider "at top" if within 10px of top
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, []);

  // Use the pull-to-close hook
  usePullToClose({ isOpen, isAtTop, headerRef, onClose });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={`fixed z-40 ${
            isMobile 
              ? 'inset-0 m-0 flex flex-col' 
              : 'bottom-20 right-4 md:bottom-24 md:right-8 w-[90vw] sm:w-[400px]'
          }`}
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            y: 20,
            scale: 0.95
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300
          }}
        >
          <Card className="finny-chat-card flex flex-col h-full">
            <div className="flex flex-col h-full keyboard-aware">
              <div className="flex-none" ref={headerRef}>
                <ChatHeader onClose={onClose} onReset={resetChat} />
              </div>
              
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

              <div className="flex-none">
                <ChatInput 
                  value={newMessage} 
                  onChange={e => setNewMessage(e.target.value)} 
                  onSubmit={handleSendMessage}
                  disabled={isAuthPromptOnly && !user}
                  isLoading={isLoading} 
                  isAuthenticated={!!user} 
                  isConnecting={isConnectingToData} 
                />
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
