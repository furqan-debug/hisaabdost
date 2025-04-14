
import React, { createContext, useState, useContext, ReactNode } from 'react';
import FinnyButton from './FinnyButton';
import FinnyChat from './FinnyChat';

interface FinnyContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const FinnyContext = createContext<FinnyContextType>({
  isOpen: false,
  openChat: () => {},
  closeChat: () => {},
  toggleChat: () => {},
});

export const useFinny = () => useContext(FinnyContext);

export const FinnyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <FinnyContext.Provider
      value={{
        isOpen,
        openChat,
        closeChat,
        toggleChat,
      }}
    >
      {children}
      <FinnyButton onClick={toggleChat} isOpen={isOpen} />
      <FinnyChat isOpen={isOpen} onClose={closeChat} />
    </FinnyContext.Provider>
  );
};
