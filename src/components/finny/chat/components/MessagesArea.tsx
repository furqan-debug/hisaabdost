
import React from 'react';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHistoryBanner } from '../ChatHistoryBanner';
import FinnyMessage from '../FinnyMessage';
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
      <ScrollArea className="h-full no-scrollbar touch-scroll-container" ref={scrollAreaRef}>
        <div className="finny-messages-container">
          <AuthAlert user={user} isAuthPromptOnly={isAuthPromptOnly} />

          {user && oldestMessageTime && <ChatHistoryBanner oldestMessageTime={oldestMessageTime} />}
          
          {isConnectingToData && user && (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full animate-pulse bg-primary/20" />
                <Loader2 className="absolute inset-0 w-10 h-10 animate-spin text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Connecting to your financial data...</span>
            </div>
          )}
        
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
  );
};
