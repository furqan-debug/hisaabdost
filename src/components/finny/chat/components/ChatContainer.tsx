
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
  const [isMinimized, setIsMinimized] = useState(false);

  // Monitor scroll position to determine if user is at the top
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleScroll = () => {
      const scrollTop = scrollArea.scrollTop;
      setIsAtTop(scrollTop <= 10);
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, []);

  // Use the pull-to-close hook
  usePullToClose({ isOpen, isAtTop, headerRef, onClose });

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={`fixed z-50 ${
            isMobile 
              ? 'inset-0 m-0 flex flex-col' 
              : isMinimized
                ? 'bottom-4 right-4 w-80 h-16'
                : 'bottom-4 right-4 md:bottom-6 md:right-6 w-[90vw] sm:w-[420px] h-[600px] md:h-[700px]'
          }`}
          initial={{
            opacity: 0,
            y: isMobile ? 100 : 50,
            scale: 0.9
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            y: isMobile ? 100 : 50,
            scale: 0.9
          }}
          transition={{
            type: 'spring',
            damping: 30,
            stiffness: 300
          }}
        >
          <Card className="finny-chat-card flex flex-col h-full overflow-hidden">
            <div className="flex flex-col h-full keyboard-aware">
              <div className="flex-none" ref={headerRef}>
                <ChatHeader 
                  onClose={onClose} 
                  onReset={resetChat} 
                  onMinimize={!isMobile ? handleMinimize : undefined}
                />
              </div>
              
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    className="flex flex-col flex-1 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
