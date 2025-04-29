
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import FinnyButton from './FinnyButton';
import FinnyChat from './FinnyChat';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/utils/formatters';
import { EXPENSE_CATEGORIES } from '@/components/expenses/form-fields/CategoryField';

interface FinnyContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  triggerChat: (message: string) => void;
  addExpense: (amount: number, category: string, description?: string, date?: string) => void;
  setBudget: (amount: number, category: string) => void;
  askFinny: (question: string) => void;
}

const FinnyContext = createContext<FinnyContextType>({
  isOpen: false,
  openChat: () => {},
  closeChat: () => {},
  toggleChat: () => {},
  triggerChat: () => {},
  addExpense: () => {},
  setBudget: () => {},
  askFinny: () => {},
});

export const useFinny = () => useContext(FinnyContext);

export const FinnyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);
  const auth = useAuth();
  const user = auth?.user || null;
  const { currencyCode } = useCurrency();

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen((prev) => !prev);
  
  const triggerChat = (message: string) => {
    if (!user) {
      toast.error("Please log in to use Finny");
      return;
    }
    
    setQueuedMessage(message);
    setIsOpen(true);
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
    const formattedAmount = formatCurrency(amount, currencyCode);
    const validCategory = validateCategory(category);
    
    let message = `Set a budget of ${formattedAmount} for ${validCategory}`;
    
    if (validCategory !== category) {
      message += ` (originally requested as "${category}")`;
    }
    
    triggerChat(message);
  };
  
  const askFinny = (question: string) => {
    triggerChat(question);
  };
  
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
      }}
    >
      {children}
      <FinnyButton onClick={openChat} isOpen={isOpen} />
      <FinnyChat isOpen={isOpen} onClose={closeChat} />
    </FinnyContext.Provider>
  );
};
