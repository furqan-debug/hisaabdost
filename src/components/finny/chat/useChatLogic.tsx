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
import { useMessageSending } from './hooks/useMessageSending';
import { supabase } from '@/integrations/supabase/client';

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

  // Enhanced message sending with insights handling
  const enhancedHandleSendMessage = async (e?: React.FormEvent, quickAction?: string) => {
    if (e) e.preventDefault();
    
    const messageToSend = quickAction || newMessage.trim();
    if (!messageToSend || isLoading || !user || isMessageLimitReached) {
      if (isMessageLimitReached) {
        toast.error(`Daily message limit reached (10 messages). Your advanced AI assistant will be available again tomorrow! 🌟`);
      }
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      content: messageToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    saveMessage(userMessage);
    setNewMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      console.log('Sending advanced message to AI service:', messageToSend);
      
      // Use Supabase edge function instead of /api/ endpoint
      const { data, error } = await supabase.functions.invoke('finny-chat', {
        body: {
          message: messageToSend,
          userId: user.id,
          chatHistory: messages.slice(-8),
          currencyCode,
          userName: user.user_metadata?.full_name,
          userAge: user.user_metadata?.age,
          userGender: user.user_metadata?.gender
        }
      });

      if (error) {
        console.error('Error calling Finny edge function:', error);
        throw new Error(`Failed to get response from Finny: ${error.message}`);
      }

      console.log('Advanced AI service response:', data);

      // Extract insights from response
      if (data.insights) {
        setInsights(data.insights);
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'I received your message but couldn\'t process it with my full advanced capabilities right now.',
        isUser: false,
        timestamp: new Date(),
        hasAction: !!data.action,
      };

      setMessages(prev => [...prev, aiMessage]);
      saveMessage(aiMessage);

      // Enhanced action handling for advanced features
      if (data.action) {
        console.log('Advanced action performed:', data.action.type);
        
        // Trigger comprehensive refresh events based on action type
        const triggerAdvancedRefreshEvents = () => {
          let events = [];
          
          // Determine events based on action type
          switch (data.action.type) {
            case 'add_expense':
            case 'update_expense':
            case 'delete_expense':
              events = [
                'expense-added',
                'finny-expense-added',
                'expenses-updated',
                'expense-refresh',
                'dashboard-refresh',
                'finny-advanced-action'
              ];
              break;
              
            case 'set_budget':
            case 'update_budget':
              events = [
                'budget-added',
                'budget-updated',
                'budget-refresh',
                'expenses-updated',
                'dashboard-refresh',
                'finny-advanced-action'
              ];
              break;
              
            case 'delete_budget':
              events = [
                'budget-deleted',
                'budget-refresh',
                'expenses-updated',
                'dashboard-refresh',
                'finny-advanced-action'
              ];
              break;
              
            default:
              // For unknown actions, dispatch all events
              events = [
                'expense-added',
                'finny-expense-added',
                'expenses-updated',
                'expense-refresh',
                'budget-added',
                'budget-updated',
                'budget-refresh',
                'dashboard-refresh',
                'finny-advanced-action'
              ];
          }
          
          events.forEach(eventName => {
            window.dispatchEvent(new CustomEvent(eventName, { 
              detail: { 
                source: 'finny-advanced-chat', 
                userId: user.id,
                action: data.action.type,
                actionData: data.action,
                timestamp: Date.now(),
                insights: data.insights
              } 
            }));
            console.log(`Dispatched ${eventName} event from Advanced Finny for action: ${data.action.type}`);
          });
        };

        // Multiple refresh triggers for maximum reliability
        triggerAdvancedRefreshEvents();
        setTimeout(triggerAdvancedRefreshEvents, 200);
        setTimeout(triggerAdvancedRefreshEvents, 800);
        setTimeout(triggerAdvancedRefreshEvents, 2000);

        // Enhanced success notification
        toast.success('✨ Advanced action completed! Your financial data has been updated with intelligent insights.');
      }

    } catch (error) {
      console.error('Error in advanced message handling:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I encountered an issue with my advanced AI systems. Please try again - I\'m working on getting back to full intelligence! 🧠⚡',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      saveMessage(errorMessage);
      
      toast.error('Advanced AI temporarily unavailable. Please try again!');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const { newMessage, setNewMessage } = useMessageSending(
    messages,
    setMessages,
    saveMessage,
    isLoading,
    setIsLoading,
    setIsTyping,
    setQuickReplies,
    currencyCode
  );

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
    enhancedHandleSendMessage(undefined, reply.action);
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
    handleSendMessage: enhancedHandleSendMessage,
    handleQuickReply,
    oldestMessageTime,
    resetChat,
    remainingDailyMessages,
    isMessageLimitReached,
    insights
  };
};
