
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useCurrency } from '@/hooks/use-currency';
import { useMessageHandling } from './hooks/useMessageHandling';
import { useMessageProcessing } from './hooks/useMessageProcessing';
import { useChatInitialization } from './hooks/useChatInitialization';
import { DEFAULT_QUICK_REPLIES } from './constants/quickReplies';
import { QuickReply } from './types';

export const useChatLogic = (queuedMessage: string | null, nameUpdateTimestamp?: number) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { currencyCode } = useCurrency();
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(DEFAULT_QUICK_REPLIES);

  // Use the message handling hooks
  const {
    messages,
    setMessages,
    newMessage,
    setNewMessage,
    isLoading,
    setIsLoading,
    isTyping,
    setIsTyping,
    oldestMessageTime,
    saveMessage,
    loadChatHistory,
    clearChatHistory
  } = useMessageHandling(setQuickReplies);

  // Use message processing hook
  const messageProcessor = useMessageProcessing(
    messages,
    setMessages,
    setQuickReplies,
    saveMessage
  );

  // Use chat initialization hook
  const {
    initializeChat,
    isConnectingToData,
    userName,
    chatInitialized
  } = useChatInitialization(
    user,
    currencyCode,
    setMessages,
    setQuickReplies,
    setIsTyping,
    saveMessage
  );

  // Reset chat function for name updates
  const resetChat = useCallback(() => {
    if (user) {
      // Clear existing messages from state and storage
      clearChatHistory();
      
      // Re-initialize the chat with fresh data
      setTimeout(() => {
        initializeChat();
      }, 500); // Short delay to ensure state is cleared first
    }
  }, [user, clearChatHistory, initializeChat]);

  // Initialize chat when component mounts or user changes
  useEffect(() => {
    if (user && !chatInitialized) {
      initializeChat();
    }
  }, [user, initializeChat, chatInitialized]);

  // Re-initialize chat if name update timestamp changes
  useEffect(() => {
    if (nameUpdateTimestamp && nameUpdateTimestamp > 0 && user) {
      console.log("Name updated, reinitializing chat");
      resetChat();
    }
  }, [nameUpdateTimestamp, user, resetChat]);

  // Process queued message if available
  useEffect(() => {
    if (queuedMessage && user && !isLoading) {
      messageProcessor.handleSendMessage(null, user, currencyCode, queuedMessage);
    }
  }, [queuedMessage, user, isLoading, currencyCode]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Send a message handler
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    
    messageProcessor.handleSendMessage(e, user, currencyCode);
  };

  // Handle quick reply click
  const handleQuickReply = (reply: QuickReply) => {
    if (!user) return;
    
    messageProcessor.handleQuickReply(reply, user, currencyCode);
  };

  return {
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
  };
};
