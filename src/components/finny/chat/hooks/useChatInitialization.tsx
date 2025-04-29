
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { formatCurrency } from '@/utils/formatters';
import { FINNY_MESSAGES } from '../constants/quickReplies';
import { Message } from '../types';
import { QuickReply } from '../types';
import { BarChart3, PieChart, Plus, Info } from 'lucide-react';
import { DEFAULT_QUICK_REPLIES } from '../constants/quickReplies';
import { CurrencyCode } from '@/utils/currencyUtils';

export const useChatInitialization = (
  user: User | null, 
  currencyCode: string,
  setMessages: (messages: Message[]) => void,
  setQuickReplies: (replies: QuickReply[]) => void,
  setIsTyping: (isTyping: boolean) => void,
  saveMessage: (message: Message) => void
) => {
  const [isConnectingToData, setIsConnectingToData] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Fetch the user's name from the profiles table
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

  const initializeChat = async () => {
    setIsConnectingToData(true);
        
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const { data: monthlyExpenses, error: monthlyError } = await supabase
        .from('expenses')
        .select('amount, category')
        .eq('user_id', user?.id)
        .gte('date', firstDayOfMonth)
        .lte('date', lastDayOfMonth);
        
      if (monthlyError) throw monthlyError;
      
      const { data: recentExpenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(5);
        
      if (expensesError) throw expensesError;
      
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user?.id);
        
      if (budgetsError) throw budgetsError;
      
      const totalMonthlySpending = monthlyExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      
      // Clear any existing messages before adding the new welcome message
      // This prevents duplicate welcome messages on re-initialization
      setMessages([]);
      
      let personalizedGreeting = FINNY_MESSAGES.GREETING;
      
      if (monthlyExpenses && monthlyExpenses.length > 0) {
        const categoryTotals: {[key: string]: number} = {};
        monthlyExpenses.forEach(exp => {
          categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
        });
        
        const topCategory = Object.entries(categoryTotals)
          .sort((a, b) => b[1] - a[1])[0];
        
        // Use the name from profiles table
        const displayName = userName || 'there';
        personalizedGreeting = `Hey ${displayName}! 🎉 Finny here to help with your finances.\nLooks like you've spent ${formatCurrency(totalMonthlySpending, currencyCode as CurrencyCode)} this month. ${topCategory[0]} took ${formatCurrency(topCategory[1], currencyCode as CurrencyCode)} — shall we explore ways to save? 🧠`;
        
        let contextReplies: QuickReply[] = [];
        
        contextReplies.push({
          text: `${topCategory[0]} analysis`,
          action: `Show my ${topCategory[0].toLowerCase()} spending breakdown`,
          icon: <BarChart3 size={14} />
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
                icon: <Info size={14} />
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
              icon: <PieChart size={14} />
            });
            break;
          }
        }
        
        setQuickReplies([
          ...contextReplies.slice(0, 3),
          ...DEFAULT_QUICK_REPLIES.slice(0, 1)
        ]);
      }
      
      // Generate a unique ID for the welcome message to prevent duplication
      const welcomeMessageId = `welcome-${Date.now()}`;
      
      setIsTyping(true);
      setTimeout(() => {
        const welcomeMessage = {
          id: welcomeMessageId,
          content: personalizedGreeting,
          isUser: false,
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        setMessages([welcomeMessage]);
        saveMessage(welcomeMessage);
        setIsTyping(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Clear any existing messages before adding the error message
      setMessages([]);
      
      const errorMessage = {
        id: `error-${Date.now()}`,
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
    initializeChat,
    isConnectingToData,
    userName
  };
};
