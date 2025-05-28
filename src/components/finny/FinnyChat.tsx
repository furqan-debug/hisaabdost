
import React, { useRef, useEffect } from 'react';
import { ChatContainer } from './chat/components/ChatContainer';
import { useChatLogic } from './chat/useChatLogic';
import { useAuth } from '@/lib/auth';
import { useCurrency } from '@/hooks/use-currency';
import { Message } from './chat/types';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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

  return (
    <ChatContainer
      isOpen={isOpen}
      onClose={onClose}
      user={user}
      oldestMessageTime={oldestMessageTime}
      isConnectingToData={isConnectingToData}
      filteredMessages={filteredMessages}
      isTyping={isTyping}
      isLoading={isLoading}
      quickReplies={quickReplies}
      messagesEndRef={messagesEndRef}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      handleSendMessage={handleSendMessage}
      handleQuickReply={handleQuickReply}
      resetChat={resetChat}
      isAuthPromptOnly={isAuthPromptOnly}
    />
  );
};

export default FinnyChat;
