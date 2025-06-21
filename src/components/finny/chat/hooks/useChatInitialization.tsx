
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useCurrency } from '@/hooks/use-currency';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatters';
import { FINNY_MESSAGES, DEFAULT_QUICK_REPLIES } from '../constants/quickReplies';
import { QuickReply, Message } from '../types';
import { Calendar, Plus } from 'lucide-react';
import { CurrencyCode } from '@/utils/currencyUtils';

export const useChatInitialization = (
  userCurrencyCode?: CurrencyCode,
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void,
  saveMessage: (message: Message) => void,
  setIsTyping: (isTyping: boolean) => void,
  setQuickReplies: (replies: QuickReply[]) => void,
  hasInitialized: boolean,
  setHasInitialized: (initialized: boolean) => void
) => {
  const [isConnectingToData, setIsConnectingToData] = useState(false);
  const { user } = useAuth();
  const { currencyCode: contextCurrencyCode } = useCurrency();
  
  const currencyCode = userCurrencyCode || contextCurrencyCode;

  useEffect(() => {
    if (!hasInitialized && user) {
      initializeChat();
      setHasInitialized(true);
    } else if (!user && hasInitialized) {
      setHasInitialized(false);
      
      const welcomeMessage = {
        id: '1',
        content: FINNY_MESSAGES.AUTH_PROMPT,
        isUser: false,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      setMessages([welcomeMessage]);
    }
  }, [user, hasInitialized]);

  useEffect(() => {
    if (user && messages.length === 1 && !messages[0].isUser && messages[0].content.includes("log in first")) {
      setMessages([]);
      setHasInitialized(false);
    } else if (!user && messages.length === 0) {
      const authPromptMessage = {
        id: '1',
        content: FINNY_MESSAGES.AUTH_PROMPT,
        isUser: false,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      setMessages([authPromptMessage]);
    }
  }, [user]);

  const initializeChat = async () => {
    if (!user) return;
    
    setIsConnectingToData(true);
    
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const { data: monthlyExpenses, error: monthlyError } = await supabase
        .from('expenses')
        .select('amount, category')
        .eq('user_id', user.id)
        .gte('date', firstDayOfMonth)
        .lte('date', lastDayOfMonth);
        
      if (monthlyError) throw monthlyError;
      
      const { data: recentExpenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);
        
      if (expensesError) throw expensesError;
      
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);
        
      if (budgetsError) throw budgetsError;
      
      const totalMonthlySpending = monthlyExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      
      let personalizedGreeting = FINNY_MESSAGES.GREETING;
      
      if (monthlyExpenses && monthlyExpenses.length > 0) {
        const categoryTotals: {[key: string]: number} = {};
        monthlyExpenses.forEach(exp => {
          categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
        });
        
        const topCategory = Object.entries(categoryTotals)
          .sort((a, b) => b[1] - a[1])[0];
        
        const userName = user?.user_metadata?.full_name || '';
        personalizedGreeting = `Hey ${userName}! 🎉 Finny here to help with your finances.\nLooks like you've spent ${formatCurrency(totalMonthlySpending, currencyCode)} this month. ${topCategory[0]} took ${formatCurrency(topCategory[1], currencyCode)} — shall we explore ways to save? 🧠`;
        
        let contextReplies: QuickReply[] = [];
        
        contextReplies.push({
          text: `${topCategory[0]} analysis`,
          action: `Show my ${topCategory[0].toLowerCase()} spending breakdown`,
          icon: <Calendar size={14} />
        });
        
        if (budgets && budgets.length > 0) {
          const budgetByCategory: {[key: string]: number} = {};
          budgets.forEach(budget => {
            budgetByCategory[budget.category] = budget.amount;
          });
          
          for (const [category, spent] of Object.entries(categoryTotals)) {
            if (budgetByCategory[category] && spent > budgetByCategory[category]) {
              contextReplies.push({
                text: `${category} budget alert`,
                action: `How am I doing with my ${category.toLowerCase()} budget?`,
                icon: <Calendar size={14} />
              });
              break;
            }
          }
        }
        
        if (recentExpenses && recentExpenses.length > 0) {
          const latestExpense = recentExpenses[0];
          contextReplies.push({
            text: `Add ${latestExpense.category}`,
            action: `I want to add a new ${latestExpense.category.toLowerCase()} expense`,
            icon: <Plus size={14} />
          });
        }
        
        const majorCategories = ['Transportation', 'Food', 'Housing', 'Entertainment'];
        for (const category of majorCategories) {
          if (categoryTotals[category] && !contextReplies.some(reply => reply.text.includes(category))) {
            contextReplies.push({
              text: `${category} breakdown`,
              action: `Show my ${category.toLowerCase()} spending breakdown`,
              icon: <Calendar size={14} />
            });
            break;
          }
        }
        
        setQuickReplies([
          ...contextReplies.slice(0, 3),
          ...DEFAULT_QUICK_REPLIES.slice(0, 1)
        ]);
      }
      
      setIsTyping(true);
      setTimeout(() => {
        const welcomeMessage = {
          id: '1',
          content: personalizedGreeting,
          isUser: false,
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        
        setMessages(prevMessages => {
          if (prevMessages.length === 0) {
            return [welcomeMessage];
          }
          return prevMessages;
        });
        
        saveMessage(welcomeMessage);
        setIsTyping(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      const errorMessage = {
        id: '1',
        content: "I've connected to your account, but I'm having trouble retrieving your latest financial data. How can I help you today?",
        isUser: false,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      setMessages([errorMessage]);
      saveMessage(errorMessage);
    } finally {
      setIsConnectingToData(false);
    }
  };

  return {
    isConnectingToData,
    initializeChat
  };
};
