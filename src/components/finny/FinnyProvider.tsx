
import React, { createContext, useState, useContext, ReactNode, useEffect, lazy, Suspense } from 'react';
import FinnyButton from './FinnyButton';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/utils/formatters';
import { EXPENSE_CATEGORIES } from '@/components/expenses/form-fields/CategoryField';
import { CurrencyCode } from '@/utils/currencyUtils';

// Lazy load the FinnyChat component
const FinnyChat = lazy(() => import('./FinnyChat'));

// Constants
const MAX_DAILY_MESSAGES = 10;
const DAILY_MESSAGE_COUNT_KEY = 'finny_daily_message_count';

interface FinnyContextType {
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

const FinnyContext = createContext<FinnyContextType>(defaultContext);

export const useFinny = () => useContext(FinnyContext);

export const FinnyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState<number>(Date.now());
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD'); // Default fallback
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [remainingDailyMessages, setRemainingDailyMessages] = useState(MAX_DAILY_MESSAGES);
  const [isMessageLimitReached, setIsMessageLimitReached] = useState(false);
  
  // Get user authentication with error handling
  const auth = useAuth();
  useEffect(() => {
    if (auth?.user) {
      setUser(auth.user);
    }
  }, [auth?.user]);
  
  // Get currency code with proper error handling
  const currency = useCurrency();
  useEffect(() => {
    if (currency?.currencyCode) {
      setCurrencyCode(currency.currencyCode);
    }
  }, [currency?.currencyCode]);

  // Initialize only when needed
  useEffect(() => {
    if (!isInitialized && isOpen) {
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized]);

  // Load and initialize daily message count
  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const storageKey = `${DAILY_MESSAGE_COUNT_KEY}_${user.id}_${today}`;
      
      try {
        const storedCount = localStorage.getItem(storageKey);
        const count = storedCount ? parseInt(storedCount, 10) : 0;
        setDailyMessageCount(count);
        setRemainingDailyMessages(MAX_DAILY_MESSAGES - count);
        setIsMessageLimitReached(count >= MAX_DAILY_MESSAGES);
      } catch (error) {
        console.error("Error loading message count from storage:", error);
        // Default to 0 if there's an error
        setDailyMessageCount(0);
        setRemainingDailyMessages(MAX_DAILY_MESSAGES);
        setIsMessageLimitReached(false);
      }
    }
  }, [user]);

  // Update remaining messages and local storage whenever count changes
  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `${DAILY_MESSAGE_COUNT_KEY}_${user.id}_${today}`;
      
      try {
        localStorage.setItem(storageKey, dailyMessageCount.toString());
        setRemainingDailyMessages(MAX_DAILY_MESSAGES - dailyMessageCount);
        setIsMessageLimitReached(dailyMessageCount >= MAX_DAILY_MESSAGES);
      } catch (error) {
        console.error("Error saving message count to storage:", error);
      }
    }
  }, [dailyMessageCount, user]);

  const incrementMessageCount = () => {
    if (user) {
      setDailyMessageCount(prevCount => {
        const newCount = prevCount + 1;
        return newCount;
      });
    }
  };

  const openChat = () => {
    console.log("Opening Finny chat, user auth status:", user ? "authenticated" : "not authenticated");
    setIsOpen(true);
  };
  
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen((prev) => !prev);
  
  const triggerChat = (message: string) => {
    if (!user) {
      toast.error("Please log in to use Finny");
      return;
    }
    
    if (isMessageLimitReached) {
      toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
      return;
    }
    
    setQueuedMessage(message);
    setIsOpen(true);
    incrementMessageCount();
  };
  
  const validateCategory = (category: string): string => {
    if (!category) return 'Miscellaneous';
    
    // Check for exact match
    const exactMatch = EXPENSE_CATEGORIES.find(
      c => c.toLowerCase() === category.toLowerCase()
    );
    
    if (exactMatch) return exactMatch;
    
    // Look for partial matches
    const partialMatches = EXPENSE_CATEGORIES.filter(
      c => c.toLowerCase().includes(category.toLowerCase()) || 
           category.toLowerCase().includes(c.toLowerCase())
    );
    
    if (partialMatches.length > 0) {
      return partialMatches[0]; // Return the first partial match
    }
    
    // No match found, use miscellaneous as fallback
    return 'Other';
  };
  
  const addExpense = (amount: number, category: string, description?: string, date?: string) => {
    if (isMessageLimitReached) {
      toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const formattedAmount = formatCurrency(amount, currencyCode);
    const validCategory = validateCategory(category);
    
    let message = `Add expense of ${formattedAmount} for ${validCategory}`;
    
    if (validCategory !== category) {
      message += ` (originally requested as "${category}")`;
    }
    
    if (description) {
      message += ` for ${description}`;
    }
    
    message += date ? ` on ${date}` : ` on ${today}`;
    
    triggerChat(message);
  };
  
  const setBudget = (amount: number, category: string) => {
    if (isMessageLimitReached) {
      toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
      return;
    }
    
    const formattedAmount = formatCurrency(amount, currencyCode);
    const validCategory = validateCategory(category);
    
    let message = `Set a budget of ${formattedAmount} for ${validCategory}`;
    
    if (validCategory !== category) {
      message += ` (originally requested as "${category}")`;
    }
    
    triggerChat(message);
  };
  
  const askFinny = (question: string) => {
    if (isMessageLimitReached) {
      toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
      return;
    }
    
    triggerChat(question);
  };
  
  const resetChat = () => {
    // Force re-render the chat component by changing key
    setChatKey(Date.now());
    
    // Clear any queued message
    setQueuedMessage(null);
    
    toast.success("Finny chat reset successfully");
  };
  
  // Refactor this effect to be more efficient with auth checking
  useEffect(() => {
    if (queuedMessage && isOpen) {
      const timer = setTimeout(() => {
        const input = document.querySelector('input[placeholder="Message Finny..."]') as HTMLInputElement;
        const sendButton = input?.parentElement?.querySelector('button[type="submit"]') as HTMLButtonElement;
        
        if (input && sendButton) {
          input.value = queuedMessage;
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
          setTimeout(() => {
            sendButton.click();
            setQueuedMessage(null);
          }, 100);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [queuedMessage, isOpen]);

  return (
    <FinnyContext.Provider
      value={{
        isOpen,
        openChat,
        closeChat,
        toggleChat,
        triggerChat,
        addExpense,
        setBudget,
        askFinny,
        resetChat,
        remainingDailyMessages,
        isMessageLimitReached
      }}
    >
      {children}
      <FinnyButton onClick={openChat} isOpen={isOpen} />
      {isInitialized && (
        <Suspense fallback={<div className="hidden">Loading Finny...</div>}>
          <FinnyChat key={chatKey} isOpen={isOpen} onClose={closeChat} />
        </Suspense>
      )}
    </FinnyContext.Provider>
  );
};
