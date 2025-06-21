
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message } from './types';

const DAILY_MESSAGE_LIMIT = 50;
const RATE_LIMIT_DELAY = 2000; // 2 seconds between messages

export const useChatLogic = (initialMessages?: Message[], currencyCode: string = 'USD') => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Finny, your personal finance assistant. I can help you track expenses, manage budgets, and answer questions about your financial data. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectingToData, setIsConnectingToData] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies] = useState([
    "Show my recent expenses",
    "What's my biggest spending category?",
    "Add a new expense",
    "How much did I spend this month?"
  ]);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [oldestMessageTime, setOldestMessageTime] = useState<Date | null>(null);

  // Track daily message usage
  useEffect(() => {
    const today = new Date().toDateString();
    const storedData = localStorage.getItem(`finny_daily_usage_${today}`);
    if (storedData) {
      const data = JSON.parse(storedData);
      setDailyMessageCount(data.count || 0);
      setOldestMessageTime(data.oldestMessageTime ? new Date(data.oldestMessageTime) : null);
    } else {
      setDailyMessageCount(0);
      setOldestMessageTime(null);
    }
  }, []);

  const incrementDailyCount = useCallback(() => {
    const today = new Date().toDateString();
    const newCount = dailyMessageCount + 1;
    const now = new Date();
    
    setDailyMessageCount(newCount);
    
    if (!oldestMessageTime) {
      setOldestMessageTime(now);
    }
    
    localStorage.setItem(`finny_daily_usage_${today}`, JSON.stringify({
      count: newCount,
      oldestMessageTime: oldestMessageTime || now
    }));
  }, [dailyMessageCount, oldestMessageTime]);

  const handleSendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText || newMessage.trim();
    if (!textToSend || isLoading) return;

    // Check daily limit
    if (dailyMessageCount >= DAILY_MESSAGE_LIMIT) {
      toast.error(`Daily message limit of ${DAILY_MESSAGE_LIMIT} reached. Try again tomorrow!`);
      return;
    }

    // Check rate limiting
    const now = Date.now();
    if (now - lastMessageTime < RATE_LIMIT_DELAY) {
      toast.error('Please wait a moment before sending another message.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    setIsConnectingToData(true);
    setIsTyping(true);
    setLastMessageTime(now);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Please log in to chat with Finny');
      }

      incrementDailyCount();

      // Get chat history (last 5 messages excluding the current one)
      const chatHistory = messages.slice(-5).map(msg => ({
        content: msg.content,
        isUser: msg.isUser
      }));

      setIsConnectingToData(false);

      const { data, error } = await supabase.functions.invoke('finny-chat', {
        body: {
          message: textToSend,
          userId: user.id,
          chatHistory,
          currencyCode
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to get response from Finny');
      }

      if (!data) {
        throw new Error('No response received from Finny');
      }

      // Handle different types of responses
      let responseText = data.response;
      
      if (data.error) {
        // Handle specific error cases with user-friendly messages
        if (data.error.includes('quota') || data.error.includes('API quota exceeded')) {
          responseText = "I'm currently experiencing high demand and my AI service is temporarily limited. Please try again in a little while, or continue using the app's other features in the meantime.";
        } else if (data.error.includes('authentication') || data.error.includes('API key')) {
          responseText = "I'm having trouble connecting to my AI service. Please contact support if this issue persists.";
        } else {
          responseText = data.response || "I'm experiencing some technical difficulties right now. Please try again in a moment.";
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If there was an action performed, refresh relevant data
      if (data.action) {
        // Dispatch event to refresh expenses list
        window.dispatchEvent(new CustomEvent('expenses-updated', { 
          detail: { timestamp: Date.now(), action: 'finny-action' }
        }));
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = "I'm sorry, I'm having trouble responding right now. ";
      
      if (error.message.includes('log in')) {
        errorMessage += "Please make sure you're logged in and try again.";
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage += "My AI service is currently experiencing high demand. Please try again later.";
      } else {
        errorMessage += "Please try again in a moment, or contact support if the issue persists.";
      }

      const errorMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessageObj]);
      toast.error('Failed to send message to Finny');
    } finally {
      setIsLoading(false);
      setIsConnectingToData(false);
      setIsTyping(false);
    }
  }, [newMessage, isLoading, messages, dailyMessageCount, lastMessageTime, incrementDailyCount, currencyCode]);

  const handleQuickReply = useCallback((reply: string) => {
    handleSendMessage(reply);
  }, [handleSendMessage]);

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm Finny, your personal finance assistant. I can help you track expenses, manage budgets, and answer questions about your financial data. How can I assist you today?",
        isUser: false,
        timestamp: new Date(),
      }
    ]);
  }, []);

  return {
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
    dailyMessageCount,
    resetChat
  };
};
