
import React, { ReactNode, lazy, Suspense } from 'react';
import FinnyButton from './FinnyButton';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/formatters';
import { FinnyContext, MAX_DAILY_MESSAGES } from './context/FinnyContext';
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
    resetChat,
    setIsOpen
  } = useFinnyChat();

  const {
    remainingDailyMessages,
    isMessageLimitReached,
    incrementMessageCount
  } = useMessageLimit(user);
  
  const triggerChat = async (message: string) => {
    try {
      if (!user) {
        toast.error("Please log in to use Finny");
        return;
      }
      
      if (isMessageLimitReached) {
        toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
        return;
      }
      
      // Try to increment the message count first
      const canSend = await incrementMessageCount();
      if (!canSend) {
        toast.error("Unable to send message. Please try again.");
        return;
      }
      
      setQueuedMessage(message);
      setIsOpen(true);
    } catch (error) {
      console.error('Error triggering chat:', error);
      toast.error("Failed to start chat. Please try again.");
    }
  };
  
  const addExpense = async (amount: number, category: string, description?: string, date?: string) => {
    try {
      if (isMessageLimitReached) {
        toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
        return;
      }
      
      // Validate inputs
      if (!amount || amount <= 0) {
        toast.error("Please provide a valid amount");
        return;
      }
      
      if (!category) {
        toast.error("Please provide a category");
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
      
      await triggerChat(message);

      // Enhanced refresh event handling
      const triggerRefreshEvents = () => {
        console.log("Triggering comprehensive refresh events for Finny expense addition");
        
        const events = [
          'expense-added',
          'expenses-updated', 
          'expense-refresh',
          'finny-expense-added',
          'dashboard-refresh'
        ];
        
        events.forEach(eventName => {
          const event = new CustomEvent(eventName, { 
            detail: { 
              timestamp: Date.now(),
              source: 'finny-chat',
              action: 'add_expense',
              amount,
              category: validCategory,
              description,
              date: date || today
            }
          });
          window.dispatchEvent(event);
          console.log(`Dispatched ${eventName} event`);
        });
      };

      // Multiple refresh triggers to ensure UI updates
      setTimeout(triggerRefreshEvents, 100);
      setTimeout(triggerRefreshEvents, 500);
      setTimeout(triggerRefreshEvents, 1000);
      setTimeout(triggerRefreshEvents, 2000);
      
    } catch (error) {
      console.error('Error adding expense via Finny:', error);
      toast.error("Failed to add expense. Please try again.");
    }
  };
  
  const setBudget = async (amount: number, category: string, period: string = "monthly") => {
    try {
      if (isMessageLimitReached) {
        toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
        return;
      }
      
      // Validate inputs
      if (!amount || amount <= 0) {
        toast.error("Please provide a valid budget amount");
        return;
      }
      
      if (!category) {
        toast.error("Please provide a category");
        return;
      }
      
      const formattedAmount = formatCurrency(amount, currencyCode);
      const validCategory = validateCategory(category);
      
      let message = `Set a ${period} budget of ${formattedAmount} for ${validCategory}`;
      
      if (validCategory !== category) {
        message += ` (originally requested as "${category}")`;
      }
      
      await triggerChat(message);
      
      // Trigger budget update events
      setTimeout(() => {
        const budgetEvent = new CustomEvent('budget-updated', { 
          detail: { 
            timestamp: Date.now(),
            action: 'set',
            category: validCategory,
            amount,
            period
          }
        });
        window.dispatchEvent(budgetEvent);
      }, 300);
      
    } catch (error) {
      console.error('Error setting budget via Finny:', error);
      toast.error("Failed to set budget. Please try again.");
    }
  };
  
  const deleteBudget = async (category: string) => {
    try {
      if (isMessageLimitReached) {
        toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
        return;
      }
      
      if (!category) {
        toast.error("Please provide a category");
        return;
      }
      
      const validCategory = validateCategory(category);
      let message = `Delete my ${validCategory} budget`;
      
      if (validCategory !== category) {
        message += ` (originally requested as "${category}")`;
      }
      
      await triggerChat(message);
      
      // Trigger budget update event
      setTimeout(() => {
        const budgetEvent = new CustomEvent('budget-updated', { 
          detail: { 
            timestamp: Date.now(),
            action: 'delete',
            category: validCategory
          }
        });
        window.dispatchEvent(budgetEvent);
      }, 300);
      
    } catch (error) {
      console.error('Error deleting budget via Finny:', error);
      toast.error("Failed to delete budget. Please try again.");
    }
  };
  
  const askFinny = async (question: string) => {
    try {
      if (isMessageLimitReached) {
        toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
        return;
      }
      
      if (!question || !question.trim()) {
        toast.error("Please provide a question");
        return;
      }
      
      await triggerChat(question.trim());
    } catch (error) {
      console.error('Error asking Finny:', error);
      toast.error("Failed to send question. Please try again.");
    }
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
        deleteBudget,
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
