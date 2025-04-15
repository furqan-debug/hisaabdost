
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import FinnyButton from './FinnyButton';
import FinnyChat from './FinnyChat';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

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
  const { user } = useAuth();

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen((prev) => !prev);
  
  // Method to open chat with a specific message
  const triggerChat = (message: string) => {
    if (!user) {
      toast.error("Please log in to use Finny");
      return;
    }
    
    setQueuedMessage(message);
    setIsOpen(true);
  };
  
  // Helper to add an expense through Finny
  const addExpense = (amount: number, category: string, description?: string, date?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const message = `Add expense of ${amount} for ${category}${description ? ` for ${description}` : ''}${date ? ` on ${date}` : ` on ${today}`}`;
    triggerChat(message);
  };
  
  // Helper to set a budget through Finny
  const setBudget = (amount: number, category: string) => {
    const message = `Set a budget of ${amount} for ${category}`;
    triggerChat(message);
  };
  
  // Helper to ask Finny a question
  const askFinny = (question: string) => {
    triggerChat(question);
  };
  
  // Process the queued message when the chat is open
  useEffect(() => {
    if (queuedMessage && isOpen) {
      // Give chat component time to initialize
      const timer = setTimeout(() => {
        // Find the input and send button
        const input = document.querySelector('input[placeholder="Message Finny..."]') as HTMLInputElement;
        const sendButton = input?.parentElement?.querySelector('button[type="submit"]') as HTMLButtonElement;
        
        if (input && sendButton) {
          // Set input value and trigger input event
          input.value = queuedMessage;
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
          // Click send button
          setTimeout(() => {
            sendButton.click();
            setQueuedMessage(null);
          }, 100);
        }
      }, 500); // Wait for chat to fully initialize
      
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
      <FinnyButton onClick={toggleChat} isOpen={isOpen} />
      <FinnyChat isOpen={isOpen} onClose={closeChat} />
    </FinnyContext.Provider>
  );
};
