
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
  };
  
  const addExpense = async (amount: number, category: string, description?: string, date?: string) => {
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
    
    await triggerChat(message);

    // Listen for successful expense addition and trigger refresh
    const handleExpenseAdded = () => {
      console.log("Expense added via Finny, triggering refresh events");
      
      // Trigger multiple refresh events to ensure UI updates
      setTimeout(() => {
        const events = ['expenses-updated', 'expense-added', 'expense-refresh'];
        events.forEach(eventName => {
          const event = new CustomEvent(eventName, { 
            detail: { 
              timestamp: Date.now(),
              source: 'finny-chat',
              action: 'add_expense'
            }
          });
          window.dispatchEvent(event);
        });
      }, 1000); // Wait 1 second for backend processing
    };

    // Set up one-time listener for this expense addition
    const cleanup = () => {
      window.removeEventListener('finny-expense-added', handleExpenseAdded);
    };

    window.addEventListener('finny-expense-added', handleExpenseAdded, { once: true });
    
    // Cleanup after 30 seconds to prevent memory leaks
    setTimeout(cleanup, 30000);
  };
  
  const setBudget = async (amount: number, category: string, period: string = "monthly") => {
    if (isMessageLimitReached) {
      toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
      return;
    }
    
    const formattedAmount = formatCurrency(amount, currencyCode);
    const validCategory = validateCategory(category);
    
    let message = `Set a ${period} budget of ${formattedAmount} for ${validCategory}`;
    
    if (validCategory !== category) {
      message += ` (originally requested as "${category}")`;
    }
    
    await triggerChat(message);
  };
  
  // Add explicit method to delete budgets
  const deleteBudget = async (category: string) => {
    if (isMessageLimitReached) {
      toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
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
  };
  
  const askFinny = async (question: string) => {
    if (isMessageLimitReached) {
      toast.error(`Daily message limit reached (${MAX_DAILY_MESSAGES} messages). Please try again tomorrow.`);
      return;
    }
    
    await triggerChat(question);
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
