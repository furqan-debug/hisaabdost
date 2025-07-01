
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

      // If an action was performed, trigger appropriate refresh events
      if (response.action) {
        console.log('Action performed:', response.action.type);
        
        // Trigger specific refresh events based on action type
        switch (response.action.type) {
          case 'add_expense':
            window.dispatchEvent(new CustomEvent('expense-added', { 
              detail: { source: 'finny-chat', userId: user.id } 
            }));
            break;
          case 'set_budget':
            window.dispatchEvent(new CustomEvent('budget-added', { 
              detail: { source: 'finny-chat', userId: user.id } 
            }));
            break;
          case 'set_income':
            window.dispatchEvent(new CustomEvent('income-updated', { 
              detail: { source: 'finny-chat', userId: user.id } 
            }));
            break;
          case 'set_goal':
            window.dispatchEvent(new CustomEvent('goal-added', { 
              detail: { source: 'finny-chat', userId: user.id } 
            }));
            break;
          case 'add_wallet_funds':
            window.dispatchEvent(new CustomEvent('wallet-updated', { 
              detail: { source: 'finny-chat', userId: user.id } 
            }));
            break;
          default:
            // Generic refresh for other actions
            window.dispatchEvent(new CustomEvent('data-updated', { 
              detail: { source: 'finny-chat', actionType: response.action.type } 
            }));
        }

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
