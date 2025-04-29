
import { useState, useEffect } from 'react';
import { Message, QuickReply } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { processMessageWithAI } from '../services/aiService';
import { useAuth } from '@/lib/auth';
import { useCurrency } from '@/hooks/use-currency';

const MESSAGE_EXPIRY_HOURS = 24;
const LOCAL_STORAGE_MESSAGES_KEY = 'finny_chat_messages';

export const useMessageHandling = (setQuickReplies: (replies: QuickReply[]) => void) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [oldestMessageTime, setOldestMessageTime] = useState<Date | undefined>();
  
  // Get user authentication status - use proper error handling
  const auth = useAuth();
  const user = auth?.user || null;
  
  // Get currency code with proper error handling
  const currency = useCurrency();
  const currencyCode = currency?.currencyCode || 'USD'; // Default fallback

  // Load chat history when the component mounts or user changes
  useEffect(() => {
    if (user) {
      loadChatHistory();
    } else {
      // Clear messages when user logs out
      setMessages([]);
      setOldestMessageTime(undefined);
    }
  }, [user]);

  const saveMessage = (message: Message) => {
    try {
      if (!message.expiresAt) {
        message.expiresAt = new Date(Date.now() + MESSAGE_EXPIRY_HOURS * 60 * 60 * 1000);
      }
      
      // Get current messages from localStorage first to ensure we don't overwrite existing ones
      const existingMessagesString = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
      let existingMessages: Array<{
        id: string;
        content: string;
        isUser: boolean;
        timestamp: string;
        hasAction?: boolean;
        visualData?: any;
        expiresAt?: string;
      }> = [];
      
      if (existingMessagesString) {
        try {
          existingMessages = JSON.parse(existingMessagesString);
        } catch (e) {
          console.error("Error parsing existing messages:", e);
        }
      }
      
      // Check if message with same ID already exists, if so, don't add it again
      if (existingMessages.some(msg => msg.id === message.id)) {
        return;
      }
      
      // Prepare the new message for storage
      const messageForStorage = {
        ...message,
        timestamp: message.timestamp.toISOString(),
        expiresAt: message.expiresAt ? message.expiresAt.toISOString() : undefined
      };
      
      // Add the new message to existing messages
      const updatedMessages = [...existingMessages, messageForStorage];
      
      // Save to localStorage
      localStorage.setItem(
        LOCAL_STORAGE_MESSAGES_KEY, 
        JSON.stringify(updatedMessages)
      );
      
      if (!oldestMessageTime || message.timestamp < oldestMessageTime) {
        setOldestMessageTime(message.timestamp);
      }
    } catch (error) {
      console.error('Error saving message to local storage:', error);
      toast.error('Failed to save message');
    }
  };

  const loadChatHistory = async () => {
    try {
      const savedMessages = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);
      
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages) as Array<{
          id: string;
          content: string;
          isUser: boolean;
          timestamp: string;
          hasAction?: boolean;
          visualData?: any;
          expiresAt?: string;
        }>;
        
        const now = new Date();
        const validMessages = parsedMessages
          .filter(msg => {
            if (!msg.expiresAt) return true;
            return new Date(msg.expiresAt) > now;
          })
          .map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
            expiresAt: msg.expiresAt ? new Date(msg.expiresAt) : undefined
          }));
          
        if (validMessages.length > 0) {
          console.log("Loaded chat history:", validMessages.length, "messages");
          setMessages(validMessages);
          
          const timestamps = validMessages.map(msg => msg.timestamp.getTime());
          const oldestTime = new Date(Math.min(...timestamps));
          setOldestMessageTime(oldestTime);
        } else {
          console.log("No valid messages found in storage");
        }
      } else {
        console.log("No messages found in localStorage");
      }
    } catch (error) {
      console.error('Error loading chat history from local storage:', error);
    }
    
    return messages.length;
  };

  const clearLocalStorage = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_MESSAGES_KEY);
      console.log('Finny chat history cleared');
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  };

  return {
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
    clearLocalStorage
  };
};
