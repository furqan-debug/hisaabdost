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
  resetChat: () => void;
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
  setQueuedMessage: () => {},
  resetChat: () => {}
});

export const useFinny = () => useContext(FinnyContext);

export const FinnyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null);
  const [lastNameUpdate, setLastNameUpdate] = useState<number>(0);
  const [chatKey, setChatKey] = useState<number>(0); // Add a key to force chat component re-render
  
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
            // Only update if name has changed to prevent unnecessary re-renders
            if (userName !== profile.full_name) {
              console.log(`Updating user name from "${userName}" to "${profile.full_name}"`);
              setUserName(profile.full_name);
              // Update timestamp to trigger re-initialization
              setLastNameUpdate(Date.now());
            }
          } else if (user.user_metadata?.full_name && userName !== user.user_metadata.full_name) {
            // Fallback to user metadata if profile name is not available
            console.log(`Using metadata name: "${user.user_metadata.full_name}"`);
            setUserName(user.user_metadata.full_name);
            setLastNameUpdate(Date.now());
          }
          
          if (error) {
            console.error('Error fetching user profile:', error);
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
        }
      } else {
        // Clear username if user logs out
        if (userName !== null) {
          setUserName(null);
        }
      }
    };

    fetchUserProfile();
    
    // Set up an interval to periodically check for name updates
    const intervalId = setInterval(fetchUserProfile, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [user, userName]);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen((prev) => !prev);
  
  const resetChat = () => {
    // Clear chat messages from localStorage
    console.log("Resetting Finny chat completely...");
    localStorage.removeItem('finny_chat_messages');
    
    // Force re-render of FinnyChat component by changing its key
    setChatKey(prevKey => prevKey + 1);
    
    // Update the name update timestamp to trigger re-initialization
    setLastNameUpdate(Date.now());
    
    // Close and re-open the chat panel to trigger a full refresh
    setIsOpen(false);
    
    // Schedule re-opening after a slight delay to ensure proper reset
    setTimeout(() => {
      toast.success("Finny has been reset");
    }, 300);
  };
  
  const triggerChat = (message: string) => {
    if (!user) {
      toast.error("Please log in to use Finny");
      return;
    }
    
    setQueuedMessage(message);
    setIsOpen(true);
  };
  
  // ... keep existing code (validateCategory function)
  
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
  
  // Use the hook for handling queued messages
  useQueuedMessage(queuedMessage, isOpen, setQueuedMessage);
  
  // Helper function for category validation from existing code
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
        setQueuedMessage,
        resetChat
      }}
    >
      {children}
      <FinnyButton onClick={openChat} isOpen={isOpen} />
      <FinnyChat 
        key={chatKey} 
        isOpen={isOpen} 
        onClose={closeChat} 
        queuedMessage={queuedMessage} 
        nameUpdateTimestamp={lastNameUpdate} 
      />
    </FinnyContext.Provider>
  );
};
