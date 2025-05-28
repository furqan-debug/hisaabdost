
import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ChatHeader from './chat/ChatHeader';
import ChatInput from './chat/ChatInput';
import FinnyMessage from './chat/FinnyMessage';
import QuickReplies from './chat/QuickReplies';
import TypingIndicator from './chat/TypingIndicator';
import { useChatLogic } from './chat/useChatLogic';
import { Message } from './chat/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHistoryBanner } from './chat/ChatHistoryBanner';
import { useAuth } from '@/lib/auth';
import { useCurrency } from '@/hooks/use-currency';

interface FinnyChatProps {
  isOpen: boolean;
  onClose: () => void;
  config?: {
    initialMessages?: Message[];
  };
}

const FinnyChat = ({
  isOpen,
  onClose,
  config
}: FinnyChatProps) => {
  const isMobile = useIsMobile();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  
  // Get user authentication status
  const { user } = useAuth();
  // Get user currency preference
  const { currencyCode } = useCurrency();

  const {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    isConnectingToData,
    isTyping,
    quickReplies,
    messagesEndRef,
    handleSendMessage,
    handleQuickReply,
    oldestMessageTime,
    resetChat
  } = useChatLogic(null, currencyCode);

  // Effect to reset chat when it's first opened
  useEffect(() => {
    if (isOpen) {
      console.log("Finny chat opened, user status:", user ? "logged in" : "not logged in", "currency:", currencyCode);
    }
  }, [isOpen, user, currencyCode]);
  
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
  
  // Filter out the auth prompt message when user is logged in
  const filteredMessages = messages.filter(message => {
    // If user is logged in, filter out the auth prompt message
    if (user && !message.isUser && message.content.includes("log in first")) {
      return false;
    }
    return true;
  });
  
  // Check if this is the initial auth prompt message
  const isAuthPromptOnly = filteredMessages.length === 1 && 
                           !filteredMessages[0].isUser && 
                           filteredMessages[0].content.includes("log in") &&
                           !user;

  // Improved pull-to-close gesture handling - only on header
  useEffect(() => {
    const header = headerRef.current;
    
    if (!isMobile || !header || !isOpen) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start gesture if we're at the top of the chat
      if (!isAtTop) return;
      
      startY = e.touches[0].clientY;
      currentY = startY;
      isDragging = false;
      startTime = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Only process if we started at the top
      if (!isAtTop) return;
      
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      const deltaTime = Date.now() - startTime;
      
      // More restrictive conditions for pull-to-close:
      // 1. Must drag down at least 100px (increased from 50px)
      // 2. Must be a reasonably fast gesture (within 800ms)
      // 3. Must maintain downward direction
      if (deltaY > 100 && deltaTime < 800 && deltaY > 0) {
        isDragging = true;
      }
    };

    const handleTouchEnd = () => {
      // Only close if all conditions are met and we're still at the top
      if (isDragging && isAtTop) {
        onClose();
      }
      
      // Reset state
      isDragging = false;
      startY = 0;
      currentY = 0;
    };

    // Add touch listeners only to the header
    header.addEventListener('touchstart', handleTouchStart, { passive: true });
    header.addEventListener('touchmove', handleTouchMove, { passive: true });
    header.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      header.removeEventListener('touchstart', handleTouchStart);
      header.removeEventListener('touchmove', handleTouchMove);
      header.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, isOpen, onClose, isAtTop]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          ref={chatContainerRef}
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
              
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full no-scrollbar touch-scroll-container" ref={scrollAreaRef}>
                  <div className="finny-messages-container">
                    {!user && !isAuthPromptOnly && (
                      <Alert variant="default" className="mb-4 bg-muted/50 border-primary/20 rounded-lg">
                        <Info className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-sm">
                          You need to log in to use Finny's personalized features.
                        </AlertDescription>
                      </Alert>
                    )}

                    {user && oldestMessageTime && <ChatHistoryBanner oldestMessageTime={oldestMessageTime} />}
                    
                    {isConnectingToData && user && <div className="flex flex-col items-center justify-center py-6 space-y-3">
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full animate-pulse bg-primary/20" />
                        <Loader2 className="absolute inset-0 w-10 h-10 animate-spin text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">Connecting to your financial data...</span>
                    </div>}
                  
                    {filteredMessages.map(message => (
                      <FinnyMessage 
                        key={message.id} 
                        content={message.content} 
                        isUser={message.isUser} 
                        timestamp={message.timestamp} 
                        hasAction={message.hasAction} 
                        visualData={message.visualData} 
                      />
                    ))}

                    {isTyping && <TypingIndicator />}
                  
                    {!isLoading && !isTyping && filteredMessages.length > 0 && !filteredMessages[filteredMessages.length - 1].isUser && (
                      <QuickReplies 
                        replies={quickReplies} 
                        onSelect={handleQuickReply} 
                        isLoading={isLoading} 
                        isAuthenticated={!!user} 
                      />
                    )}
                  
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

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

export default FinnyChat;
