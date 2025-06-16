
import React, { useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import ChatInput from '../ChatInput';
import TypingIndicator from '../TypingIndicator';
import QuickReplies from '../QuickReplies';
import { Message, QuickReply } from '../types';
import { formatDistanceToNow } from 'date-fns';

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
  handleSendMessage: (e: React.FormEvent | null, customMessage?: string) => void;
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
  const chatHeaderRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [chatHeight, setChatHeight] = React.useState<number>(600);
  const [keyboardHeight, setKeyboardHeight] = React.useState<number>(0);

  React.useEffect(() => {
    if (!isMobile) {
      const calculateChatHeight = () => {
        const headerHeight = chatHeaderRef.current?.offsetHeight || 60;
        const windowHeight = window.innerHeight;
        const maxHeight = windowHeight * 0.8;
        const calculatedHeight = Math.min(maxHeight, 600);
        setChatHeight(calculatedHeight - headerHeight);
      };

      calculateChatHeight();
      window.addEventListener('resize', calculateChatHeight);

      return () => {
        window.removeEventListener('resize', calculateChatHeight);
      };
    }
  }, [isMobile]);

  // Handle keyboard visibility on mobile
  React.useEffect(() => {
    if (!isMobile) return;

    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const keyboardHeightCalc = window.innerHeight - visualViewport.height;
        setKeyboardHeight(Math.max(0, keyboardHeightCalc));
      }
    };

    const handleViewportChange = () => {
      if (window.visualViewport) {
        const keyboardHeightCalc = window.innerHeight - window.visualViewport.height;
        setKeyboardHeight(Math.max(0, keyboardHeightCalc));
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [isMobile]);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages, isTyping]);

  if (!isOpen) return null;

  return (
    <div className={`
      fixed inset-0 z-50 
      ${isMobile ? 'bg-slate-900 finny-chat-mobile-fix' : 'pointer-events-none'}
    `}>
      <Card 
        className={`
          finny-chat-card
          ${isMobile 
            ? 'h-full w-full rounded-none border-0' 
            : 'fixed bottom-4 right-4 w-96 h-[600px] max-h-[80vh]'
          }
          ${isMobile ? '' : 'pointer-events-auto'}
          overflow-hidden flex flex-col
        `}
        style={isMobile ? {
          height: keyboardHeight > 0 ? `calc(100vh - ${keyboardHeight}px)` : '100vh',
          transition: 'height 0.2s ease-in-out'
        } : {}}
      >
        {/* Header */}
        <div ref={chatHeaderRef} className="finny-chat-header p-4 border-b border-slate-700/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=100&h=100&fit=crop&crop=face" alt="Finny AI Avatar" />
                <AvatarFallback>🐱</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <h3 className="font-medium text-sm">Finny AI</h3>
                <p className="text-xs text-muted-foreground">
                  Online
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="hover:bg-slate-700/20 rounded-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Messages Area with proper scrolling */}
        <div className="flex-1 min-h-0">
          <ScrollArea 
            className="h-full touch-scroll-container"
            ref={scrollAreaRef}
          >
            <div className="finny-messages-container p-4">
              {isConnectingToData && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="text-sm font-medium text-white mb-1">Connecting to Finny</div>
                    <div className="text-xs text-gray-400">Analyzing your financial data...</div>
                  </div>
                </div>
              )}
              
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`finny-message ${message.isUser ? 'finny-message-user text-right' : 'finny-message-bot text-left'} mb-4`}
                >
                  <div className="flex flex-col">
                    <div className={`finny-message-content max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.isUser 
                        ? 'bg-blue-600 text-white ml-auto' 
                        : 'bg-slate-800 text-slate-200 mr-auto'
                    }`}>
                      {message.content}
                    </div>
                    <span className="text-[0.65rem] text-slate-400 mt-1 px-2">
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="finny-message finny-message-bot text-left mb-4">
                  <TypingIndicator />
                </div>
              )}

              {!isLoading && !isTyping && filteredMessages.length > 0 && !filteredMessages[filteredMessages.length - 1].isUser && (
                <QuickReplies 
                  replies={quickReplies} 
                  onSelect={handleQuickReply} 
                  isLoading={isLoading} 
                  isAuthenticated={!!user} 
                />
              )}

              <div ref={messagesEndRef} className="h-1" />
            </div>
          </ScrollArea>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="finny-chat-input keyboard-avoid flex-shrink-0">
          <ChatInput
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onSubmit={handleSendMessage}
            isLoading={isLoading}
            isAuthenticated={!!user}
          />
        </div>
      </Card>
    </div>
  );
};
