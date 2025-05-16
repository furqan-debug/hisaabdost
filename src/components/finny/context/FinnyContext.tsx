
import React, { createContext, useContext } from 'react';

// Constants for message limits
export const MAX_DAILY_MESSAGES = 10;
export const DAILY_MESSAGE_COUNT_KEY = 'finny_daily_message_count';

interface FinnyContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void; // Add the missing toggleChat property
  triggerChat?: (message: string) => void;
  addExpense: (amount: number, category: string, description?: string, date?: string) => void;
  setBudget: (amount: number, category: string, period?: string) => void;
  askFinny: (message: string) => void;
  remainingDailyMessages: number;
  isMessageLimitReached: boolean;
  resetChat: () => void;
}

export const FinnyContext = createContext<FinnyContextType | undefined>(undefined);

export const useFinny = () => {
  const context = useContext(FinnyContext);
  if (context === undefined) {
    throw new Error('useFinny must be used within a FinnyProvider');
  }
  return context;
};
