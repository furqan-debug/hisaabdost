
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { QuickReply } from './types';
import { DEFAULT_QUICK_REPLIES, FINNY_MESSAGES } from './constants/quickReplies';
import { useMessageHandling } from './hooks/useMessageHandling';
import { useCurrency } from '@/hooks/use-currency';
import { useFinny } from '../context/FinnyContext';
import { CurrencyCode } from '@/utils/currencyUtils';
import { useChatInitialization } from './hooks/useChatInitialization';
import { useEnhancedMessageSending } from './hooks/useEnhancedMessageSending';

export const useChatLogic = (queuedMessage: string | null, userCurrencyCode?: CurrencyCode) => {
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(DEFAULT_QUICK_REPLIES);
  const [insights, setInsights] = useState<any>(null);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { currencyCode: contextCurrencyCode } = useCurrency();
  const { remainingDailyMessages, isMessageLimitReached } = useFinny();
  
  const currencyCode = userCurrencyCode || contextCurrencyCode;

  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    isTyping,
    setIsTyping,
    oldestMessageTime,
    saveMessage,
    loadChatHistory,
    clearLocalStorage
  } = useMessageHandling();

  const { isConnectingToData, initializeChat } = useChatInitialization(
    setMessages,
    saveMessage,
    setIsTyping,
    setQuickReplies,
    hasInitialized,
    setHasInitialized,
    userCurrencyCode
  );

  const { newMessage, setNewMessage, handleSendMessage } = useEnhancedMessageSending({
    messages,
    setMessages,
    saveMessage,
    setIsLoading,
    setIsTyping,
    setInsights,
    currencyCode
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleQuickReply = (reply: QuickReply) => {
    if (isLoading || !user || isMessageLimitReached) {
      if (isMessageLimitReached) {
        toast.error(`Daily message limit reached (10 messages). Your advanced assistant will return tomorrow! 🌟`);
      }
      return;
    }
    console.log("Advanced quick reply selected:", reply.action);
    handleSendMessage(undefined, reply.action);
  };
  
  const resetChat = () => {
    clearLocalStorage();
    setMessages([]);
    setInsights(null);
    setHasInitialized(false);
    
    if (user) {
      setTimeout(() => {
        initializeChat();
      }, 500);
    } else {
      const welcomeMessage = {
        id: '1',
        content: FINNY_MESSAGES.AUTH_PROMPT,
        isUser: false,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      setMessages([welcomeMessage]);
    }
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
    resetChat,
    remainingDailyMessages,
    isMessageLimitReached,
    insights
  };
};
