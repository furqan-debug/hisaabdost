
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/utils/formatters';
import { supabase } from '@/integrations/supabase/client';

// Constants for message limits
export const MAX_DAILY_MESSAGES = 10;
export const DAILY_MESSAGE_COUNT_KEY = 'finny_daily_message_count';

interface FinnyContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  addExpense: (amount: number, category: string, description?: string, date?: string) => void;
  setBudget: (amount: number, category: string, period?: string) => void;
  askFinny: (message: string) => void;
  remainingDailyMessages: number;
  isMessageLimitReached: boolean;
  resetChat?: () => void; // Add resetChat to the interface
}

export const FinnyContext = createContext<FinnyContextType | undefined>(undefined);

const defaultContext: FinnyContextType = {
  isOpen: false,
  openChat: () => {},
  closeChat: () => {},
  addExpense: () => {},
  setBudget: () => {},
  askFinny: () => {},
  remainingDailyMessages: 10,
  isMessageLimitReached: false,
  resetChat: () => {},
};

export const FinnyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { currencyCode } = useCurrency();
  const [remainingDailyMessages, setRemainingDailyMessages] = useState(10);
  const [isMessageLimitReached, setIsMessageLimitReached] = useState(false);

  useEffect(() => {
    const fetchMessageCount = async () => {
      if (user) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const { data, error } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', startOfDay.toISOString())
          .lt('created_at', endOfDay.toISOString());

        if (error) {
          console.error('Error fetching message count:', error);
        } else {
          const messageCount = data.length;
          const remaining = Math.max(0, 10 - messageCount);
          setRemainingDailyMessages(remaining);
          setIsMessageLimitReached(remaining === 0);
        }
      } else {
        // Reset message count when user logs out
        setRemainingDailyMessages(10);
        setIsMessageLimitReached(false);
      }
    };

    fetchMessageCount();
  }, [user]);

  const openChat = () => {
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
  };
  
  const resetChat = () => {
    // This function will be called from useSignOut to reset the chat state
    console.log("Chat reset requested");
    // Any additional reset logic can be added here
  };

  const addExpense = (amount: number, category: string, description?: string, date?: string) => {
    if (!user) {
      toast.error('You need to sign in to add expenses');
      return;
    }

    const message = `Add an expense of ${formatCurrency(amount, currencyCode)} for ${category} ${description ? `(${description})` : ''} ${date ? `on ${date}` : ''}`;
    askFinny(message);
  };

  const setBudget = (amount: number, category: string, period: string = "monthly") => {
    if (!user) {
      toast.error('You need to sign in to set budgets');
      return;
    }
    
    const message = `Set a ${period} budget of ${formatCurrency(amount, currencyCode)} for ${category}`;
    askFinny(message);
  };

  const askFinny = async (message: string) => {
    if (!user) {
      toast.error('You need to sign in to chat with Finny');
      return;
    }

    if (isMessageLimitReached) {
      toast.error('Daily message limit reached. Please try again tomorrow.');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('finny-chat', {
        body: {
          message,
          userId: user.id,
        },
      });

      if (error) {
        console.error('Error calling Finny:', error);
        toast.error('Failed to send message. Please try again.');
      } else {
        // Optimistically update the message count
        setRemainingDailyMessages(prev => Math.max(0, prev - 1));
        setIsMessageLimitReached(remainingDailyMessages <= 1);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const value = {
    isOpen,
    openChat,
    closeChat,
    addExpense,
    setBudget,
    askFinny,
    remainingDailyMessages,
    isMessageLimitReached,
    resetChat, // Include resetChat in the context value
  };

  return (
    <FinnyContext.Provider value={value}>
      {children}
    </FinnyContext.Provider>
  );
};

export const useFinny = () => {
  const context = useContext(FinnyContext);
  if (context === undefined) {
    throw new Error('useFinny must be used within a FinnyProvider');
  }
  return context;
};
