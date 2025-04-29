
import { useState, useEffect } from 'react';
import { Message, QuickReply } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  const { user } = useAuth();
  const { currencyCode } = useCurrency();

  // Load chat history when the component mounts or user changes
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const saveMessage = (message: Message) => {
    if (!user) return;
    
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
      
      // Check for duplicate messages with the same content
      // Skip saving if we find a duplicate non-user message with similar content
      if (!message.isUser) {
        const duplicateMessage = existingMessages.find(msg => 
          !JSON.parse(msg.isUser.toString()) && // Make sure it's not a user message
          msg.content.trim().substring(0, 50) === message.content.trim().substring(0, 50) && // Compare first 50 chars
          new Date(msg.timestamp).getTime() > Date.now() - 10 * 60 * 1000 // Added in the last 10 minutes
        );

        if (duplicateMessage) {
          console.log("Skipping duplicate message:", message.content.substring(0, 30) + "...");
          return;
        }
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

  const loadChatHistory = () => {
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
          }))
          // Filter out duplicates by selecting only the most recent message with the same content
          .filter((msg, index, self) => {
            if (msg.isUser) return true; // Keep all user messages
            
            // For non-user messages, find the latest message with the same content prefix (first 50 chars)
            const contentPrefix = msg.content.trim().substring(0, 50);
            const latestDuplicate = self
              .filter(m => !m.isUser && m.content.trim().substring(0, 50) === contentPrefix)
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
              
            // Only keep this message if it's the latest duplicate
            return latestDuplicate.id === msg.id;
          });
          
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
  };

  // Make sure messages are cleared when user logs out
  useEffect(() => {
    if (!user) {
      setMessages([]);
      setOldestMessageTime(undefined);
    }
  }, [user]);

  // Provide a method to clear chat history
  const clearChatHistory = () => {
    console.log("Clearing chat history from local storage");
    localStorage.removeItem(LOCAL_STORAGE_MESSAGES_KEY);
    setMessages([]);
    setOldestMessageTime(undefined);
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
    clearChatHistory
  };
};
