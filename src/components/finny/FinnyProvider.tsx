
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import FinnyButton from './FinnyButton';
import FinnyChat from './FinnyChat';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { useCurrency } from '@/hooks/use-currency';
import { formatCurrency } from '@/utils/formatters';
import { EXPENSE_CATEGORIES } from '@/components/expenses/form-fields/CategoryField';
import { supabase } from '@/integrations/supabase/client';
import { useQueuedMessage } from './chat/hooks/useQueuedMessage';

interface FinnyContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  triggerChat: (message: string) => void;
  addExpense: (amount: number, category: string, description?: string, date?: string) => void;
  setBudget: (amount: number, category: string) => void;
  askFinny: (question: string) => void;
  queuedMessage: string | null;
  setQueuedMessage: (message: string | null) => void;
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
  queuedMessage: null,
  setQueuedMessage: () => {}
});

export const useFinny = () => useContext(FinnyContext);

export const FinnyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);
  
  // Get auth context - now we're sure we're inside the Router context
  const auth = useAuth();
  const user = auth.user;
  
  const { currencyCode } = useCurrency();
  const [userName, setUserName] = useState<string | null>(null);

  // Fetch user's name from profiles table
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          if (profile && profile.full_name) {
            setUserName(profile.full_name);
          } else if (user.user_metadata?.full_name) {
            // Fallback to user metadata if profile name is not available
            setUserName(user.user_metadata.full_name);
          }
          
          if (error) {
            console.error('Error fetching user profile:', error);
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

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
  
  // Use the new hook for handling queued messages
  useQueuedMessage(queuedMessage, isOpen, setQueuedMessage);

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
        queuedMessage,
        setQueuedMessage
      }}
    >
      {children}
      <FinnyButton onClick={openChat} isOpen={isOpen} />
      <FinnyChat isOpen={isOpen} onClose={closeChat} queuedMessage={queuedMessage} />
    </FinnyContext.Provider>
  );
};
