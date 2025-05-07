
import React, { ReactNode, lazy, Suspense } from 'react';
import FinnyButton from './FinnyButton';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/formatters';
import { FinnyContext } from './context/FinnyContext';
import { useFinnyChat } from './hooks/useFinnyChat';
import { useMessageLimit } from './hooks/useMessageLimit';
import { validateCategory } from './utils/categoryUtils';

// Lazy load the FinnyChat component
const FinnyChat = lazy(() => import('./FinnyChat'));

export const FinnyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    isOpen,
    openChat,
    closeChat,
    toggleChat,
    queuedMessage,
    setQueuedMessage,
    chatKey,
    isInitialized,
    user,
    currencyCode,
    resetChat
  } = useFinnyChat();

  const {
    remainingDailyMessages,
    isMessageLimitReached,
    incrementMessageCount
  } = useMessageLimit(user);
  
  const triggerChat = (message: string) => {
    if (!user) {
      toast.error("Please log in to use Finny");
      return;
    }
    
    if (isMessageLimitReached) {
      toast.error(`Daily message limit reached (10 messages). Please try again tomorrow.`);
      return;
    }
    
    setQueuedMessage(message);
    setIsOpen(true);
    incrementMessageCount();
  };
  
  const addExpense = (amount: number, category: string, description?: string, date?: string) => {
    if (isMessageLimitReached) {
      toast.error(`Daily message limit reached (10 messages). Please try again tomorrow.`);
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
      toast.error(`Daily message limit reached (10 messages). Please try again tomorrow.`);
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
      toast.error(`Daily message limit reached (10 messages). Please try again tomorrow.`);
      return;
    }
    
    triggerChat(question);
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
