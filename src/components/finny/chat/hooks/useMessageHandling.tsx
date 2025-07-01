
import { useState, useCallback } from 'react';
import { Message } from '../types';
import { aiService } from '../services/aiService';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export function useMessageHandling() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m Finny, your personal finance assistant. I can help you track expenses, set budgets, and manage your financial goals. What would you like to do today?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!user) {
      toast.error('Please sign in to use Finny');
      return;
    }

    const userMessage = addMessage({
      text,
      isUser: true,
      timestamp: new Date(),
    });

    setIsLoading(true);

    try {
      console.log('Sending message to AI service:', text);
      const response = await aiService.sendMessage(text, user.id);
      
      console.log('AI service response:', response);
      
      const aiMessage = addMessage({
        text: response.message || 'I received your message but couldn\'t process it properly.',
        isUser: false,
        timestamp: new Date(),
        actionPerformed: response.actionPerformed,
        confidence: response.confidence,
      });

      // If an action was performed, trigger appropriate refresh events
      if (response.actionPerformed && response.actionType) {
        console.log('Action performed:', response.actionType);
        
        // Trigger specific refresh events based on action type
        switch (response.actionType) {
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
              detail: { source: 'finny-chat', actionType: response.actionType } 
            }));
        }

        // Show success toast
        toast.success('Action completed successfully! Data has been updated.');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
        isError: true,
      });
      
      toast.error('Failed to process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user, addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m Finny, your personal finance assistant. How can I help you today?',
        isUser: false,
        timestamp: new Date(),
      }
    ]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}
