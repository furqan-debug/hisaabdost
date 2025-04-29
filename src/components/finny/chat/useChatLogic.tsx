
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { QuickReply } from './types';
import { DEFAULT_QUICK_REPLIES, FINNY_MESSAGES } from './constants/quickReplies';
import { useMessageHandling } from './hooks/useMessageHandling';
import { useCurrency } from '@/hooks/use-currency';
import { useChatInitialization } from './hooks/useChatInitialization';
import { useMessageProcessing } from './hooks/useMessageProcessing';
import { useQueuedMessage } from './hooks/useQueuedMessage';

export const useChatLogic = (queuedMessage: string | null) => {
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(DEFAULT_QUICK_REPLIES);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currencyCode } = useCurrency();

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
    loadChatHistory
  } = useMessageHandling(setQuickReplies);

  const { 
    initializeChat,
    isConnectingToData,
    userName
  } = useChatInitialization(
    user, 
    currencyCode, 
    setMessages, 
    setQuickReplies, 
    setIsTyping, 
    saveMessage
  );

  const {
    handleSendMessage: processMessageAndSend,
    handleQuickReply: processQuickReply,
    setNewMessage: setProcessingNewMessage
  } = useMessageProcessing(
    messages, 
    setMessages, 
    setQuickReplies, 
    saveMessage
  );

  // Make sure newMessage stays in sync between hooks
  useEffect(() => {
    setProcessingNewMessage(newMessage);
  }, [newMessage, setProcessingNewMessage]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (user && messages.length === 0) {
      initializeChat();
    } else if (!user) {
      // Clear any existing messages
      setMessages([]);
      
      const welcomeMessage = {
        id: '1',
        content: FINNY_MESSAGES.AUTH_PROMPT,
        isUser: false,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      setMessages([welcomeMessage]);
      saveMessage(welcomeMessage);
    }
  }, [user, currencyCode, initializeChat, messages.length, saveMessage, setMessages]);

  const handleSendMessage = (e: React.FormEvent | null, customMessage?: string) => {
    return processMessageAndSend(e, user, currencyCode, customMessage);
  };

  const handleQuickReply = (reply: QuickReply) => {
    return processQuickReply(reply, user, currencyCode);
  };

  // Handle queued messages (from outside components)
  useQueuedMessage(queuedMessage, true, setQueuedMessage => {
    // This is a dummy function since we don't have access to the original setQueuedMessage
    // In a real implementation, this would be passed down from the parent component
    console.log("Message queued:", queuedMessage);
  });

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
    oldestMessageTime
  };
};
