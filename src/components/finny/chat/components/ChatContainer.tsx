
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

import { QuickActionsPanel } from '../../components/QuickActionsPanel';
import { ProactiveInsights } from '../../components/ProactiveInsights';
import { QuickAction } from '../../constants/quickActions';

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
  const [chatHeight, setChatHeight] = React.useState<number>(600);

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

  const handleQuickAction = (action: QuickAction) => {
    // For manual expense entry, we should trigger the expense form instead of sending a message
    if (action.type === 'expense' && action.id === 'manual-entry') {
      // Trigger the expense form to open
      const event = new CustomEvent('open-expense-form', {
        detail: { mode: 'manual' }
      });
      window.dispatchEvent(event);
      
      // Close the chat if on mobile
      if (isMobile) {
        onClose();
      }
      return;
    }
    
    // For other actions, send the message as before
    handleSendMessage(null, action.action);
  };

  const handleInsightAction = (action: string) => {
    handleSendMessage(null, action);
  };

  if (!isOpen) return null;

  return (
    <div className={`
      fixed inset-0 z-50 
      ${isMobile ? 'bg-slate-900 finny-chat-mobile-fix' : 'pointer-events-none'}
    `}>
      <Card className={`
        finny-chat-card
        ${isMobile 
          ? 'h-full w-full rounded-none border-0' 
          : 'fixed bottom-4 right-4 w-96 h-[600px] max-h-[80vh]'
        }
        ${isMobile ? '' : 'pointer-events-auto'}
        overflow-hidden flex flex-col
      `}>
        {/* Header */}
        <div className="finny-chat-header p-4 border-b border-slate-700/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/finny-avatar.png" alt="Finny AI Avatar" />
                <AvatarFallback>FA</AvatarFallback>
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

        {/* Enhanced Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {user && !isAuthPromptOnly && (
            <div className="flex-shrink-0 p-3 border-b border-slate-700/30 space-y-3">
              <ProactiveInsights onInsightAction={handleInsightAction} />
              <QuickActionsPanel onActionSelect={handleQuickAction} isLoading={isLoading} />
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full finny-messages-container">
              {isConnectingToData && (
                <div className="flex items-center justify-center h-full">
                  Connecting to your data...
                </div>
              )}
              
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`finny-message ${message.isUser ? 'finny-message-user text-right' : 'finny-message-bot text-left'} mb-3 last:mb-0`}
                >
                  <div className="flex flex-col">
                    <div className={`finny-message-content max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-2 ${message.isUser ? 'bg-blue-600 text-white ml-auto' : 'bg-slate-800 text-slate-200 mr-auto'}`}>
                      {message.content}
                    </div>
                    <span className="text-[0.65rem] text-slate-400 mt-1 ml-auto mr-0">
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="finny-message finny-message-bot text-left mb-3">
                  <TypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="finny-chat-input keyboard-avoid flex-shrink-0">
            <ChatInput
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onSubmit={handleSendMessage}
              isLoading={isLoading}
              isAuthenticated={!!user}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
