
import { createContext, useContext } from 'react';

// Constants
export const MAX_DAILY_MESSAGES = 10;
export const DAILY_MESSAGE_COUNT_KEY = 'finny_daily_message_count';

export interface FinnyContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  triggerChat: (message: string) => void;
  addExpense: (amount: number, category: string, description?: string, date?: string) => void;
  setBudget: (amount: number, category: string) => void;
  askFinny: (question: string) => void;
  resetChat: () => void;
  remainingDailyMessages: number;
  isMessageLimitReached: boolean;
}

const defaultContext: FinnyContextType = {
  isOpen: false,
  openChat: () => {},
  closeChat: () => {},
  toggleChat: () => {},
  triggerChat: () => {},
  addExpense: () => {},
  setBudget: () => {},
  askFinny: () => {},
  resetChat: () => {},
  remainingDailyMessages: MAX_DAILY_MESSAGES,
  isMessageLimitReached: false
};

export const FinnyContext = createContext<FinnyContextType>(defaultContext);

export const useFinny = () => useContext(FinnyContext);
