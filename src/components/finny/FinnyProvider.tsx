
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
}

const FinnyContext = createContext<FinnyContextType>({
  isOpen: false,
  openChat: () => {},
  closeChat: () => {},
  toggleChat: () => {},
  triggerChat: () => {},
});

export const useFinny = () => useContext(FinnyContext);

export const FinnyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
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
    
    setInitialMessage(message);
    setIsOpen(true);
  };
  
  // If there's an initial message, set it then clear it
  useEffect(() => {
    if (initialMessage && isOpen) {
      // We'll handle this in a future step
      // when we implement command processing
      setInitialMessage(null);
    }
  }, [initialMessage, isOpen]);

  return (
    <FinnyContext.Provider
      value={{
        isOpen,
        openChat,
        closeChat,
        toggleChat,
        triggerChat,
      }}
    >
      {children}
      <FinnyButton onClick={toggleChat} isOpen={isOpen} />
      <FinnyChat isOpen={isOpen} onClose={closeChat} />
    </FinnyContext.Provider>
  );
};
