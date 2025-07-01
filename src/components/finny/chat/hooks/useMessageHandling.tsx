import { useState, useCallback } from 'react';
import { Message } from '../types';
import { processMessageWithAI } from '../services/aiService';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export function useMessageHandling() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m Finny, your personal finance assistant. I can help you track expenses, set budgets, and manage your financial goals. What would you like to do today?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [oldestMessageTime, setOldestMessageTime] = useState<Date | null>(null);
  const { user } = useAuth();

  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const saveMessage = useCallback((message: Message) => {
    // Save to localStorage or other persistence layer
    try {
      const existingMessages = JSON.parse(localStorage.getItem('finny-messages') || '[]');
      const updatedMessages = [...existingMessages, message];
      localStorage.setItem('finny-messages', JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }, []);

  const loadChatHistory = useCallback(() => {
    try {
      const savedMessages = JSON.parse(localStorage.getItem('finny-messages') || '[]');
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
        setOldestMessageTime(new Date(savedMessages[0].timestamp));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);

  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem('finny-messages');
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!user) {
      toast.error('Please sign in to use Finny');
      return;
    }

    const userMessage = addMessage({
      content: text,
      isUser: true,
      timestamp: new Date(),
    });

    setIsLoading(true);

    try {
      console.log('Sending message to AI service:', text);
      const response = await processMessageWithAI(text, user.id, messages.slice(-5));
      
      console.log('AI service response:', response);
      
      const aiMessage = addMessage({
        content: response.response || 'I received your message but couldn\'t process it properly.',
        isUser: false,
        timestamp: new Date(),
        hasAction: !!response.action,
      });

      // If an action was performed, trigger comprehensive refresh events
      if (response.action) {
        console.log('Action performed:', response.action.type);
        
        // Trigger multiple refresh events with different timings
        const triggerRefreshEvents = () => {
          const events = [
            'expense-added',
            'finny-expense-added',
            'expenses-updated',
            'expense-refresh',
            'dashboard-refresh'
          ];
          
          events.forEach(eventName => {
            window.dispatchEvent(new CustomEvent(eventName, { 
              detail: { 
                source: 'finny-chat', 
                userId: user.id,
                action: response.action.type,
                timestamp: Date.now()
              } 
            }));
            console.log(`Dispatched ${eventName} event from Finny`);
          });
        };

        // Trigger events immediately and with delays
        triggerRefreshEvents();
        setTimeout(triggerRefreshEvents, 100);
        setTimeout(triggerRefreshEvents, 500);
        setTimeout(triggerRefreshEvents, 1000);
        setTimeout(triggerRefreshEvents, 2000);

        // Show success toast
        toast.success('Action completed successfully! Data has been updated.');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
      });
      
      toast.error('Failed to process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user, addMessage, messages]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: '1',
        content: 'Hello! I\'m Finny, your personal finance assistant. How can I help you today?',
        isUser: false,
        timestamp: new Date(),
      }
    ]);
  }, []);

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    isTyping,
    setIsTyping,
    oldestMessageTime,
    saveMessage,
    loadChatHistory,
    clearLocalStorage,
    sendMessage,
    clearMessages,
  };
}
