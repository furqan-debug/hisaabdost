
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { QuickReply } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DEFAULT_QUICK_REPLIES, FINNY_MESSAGES } from './constants/quickReplies';
import { useMessageHandling } from './hooks/useMessageHandling';
import { processMessageWithAI } from './services/aiService';
import { updateQuickRepliesForResponse } from './services/quickReplyService';
import { PATTERNS } from './utils/messagePatterns';
import { useCurrency } from '@/hooks/use-currency';
import { 
  PieChart, 
  BarChart3, 
  Plus, 
  Calendar, 
  DollarSign, 
  Info, 
  ArrowRight, 
  PiggyBank,
  Trash2,
  ChartPie
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export const useChatLogic = (queuedMessage: string | null) => {
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(DEFAULT_QUICK_REPLIES);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isConnectingToData, setIsConnectingToData] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { currencyCode } = useCurrency();

  const {
    messages,
    setMessages,
    newMessage,
    setNewMessage,
    isLoading,
    setIsLoading,
    isTyping,
    setIsTyping,
    oldestMessageTime,
    saveMessage,
    loadChatHistory,
    clearLocalStorage
  } = useMessageHandling(setQuickReplies);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // Only initialize if we haven't already and either have no messages or user status changed
    if (!hasInitialized && user) {
      initializeChat();
      setHasInitialized(true);
    } else if (!user && hasInitialized) {
      // Reset initialization state when user logs out
      setHasInitialized(false);
      
      // Show welcome message for non-authenticated users
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

  // Check for user on mount and show auth prompt if needed
  useEffect(() => {
    if (!user && messages.length === 0) {
      const authPromptMessage = {
        id: '1',
        content: FINNY_MESSAGES.AUTH_PROMPT,
        isUser: false,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      setMessages([authPromptMessage]);
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent | null, customMessage?: string) => {
    if (e) e.preventDefault();
    
    let messageText = customMessage || newMessage;
    if (!messageText.trim() || isLoading) return;

    if (!user) {
      toast.error("Please log in to chat with Finny");
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      content: messageText,
      isUser: true,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    setMessages(prev => [...prev, userMessage]);
    saveMessage(userMessage);
    setNewMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const recentMessages = [...messages.slice(-5), userMessage];

      const categoryMatch = messageText.match(PATTERNS.CATEGORY);
      const summaryMatch = messageText.match(PATTERNS.SUMMARY);
      const deleteExpenseMatch = messageText.match(PATTERNS.DELETE_EXPENSE);
      const deleteBudgetMatch = messageText.match(PATTERNS.DELETE_BUDGET);
      const deleteGoalMatch = messageText.match(PATTERNS.DELETE_GOAL);
      const visualizationMatch = messageText.match(PATTERNS.VISUALIZATION);
      const goalMatch = messageText.match(PATTERNS.GOAL);

      let analysisType = "general";
      let specificCategory = null;

      if (goalMatch) {
        messageText = `${messageText}\n\nPlease create a goal with the following details: 
        - amount: ${goalMatch[1]}
        - deadline: ${goalMatch[2]}
        - title: "Savings Goal"
        - category: Savings`;
      }

      if (categoryMatch) {
        analysisType = "category";
        specificCategory = categoryMatch[1];
      } else if (summaryMatch) {
        analysisType = "summary";
      } else if (visualizationMatch) {
        analysisType = "visualization";
        specificCategory = visualizationMatch[2];
      } else if (deleteExpenseMatch) {
        analysisType = "delete_expense";
        specificCategory = deleteExpenseMatch[1].trim();
      } else if (deleteBudgetMatch) {
        analysisType = "delete_budget";
        specificCategory = deleteBudgetMatch[1].trim();
      } else if (deleteGoalMatch) {
        analysisType = "delete_goal";
        specificCategory = deleteGoalMatch[1].trim();
      }

      const data = await processMessageWithAI(messageText, user.id, recentMessages, analysisType, specificCategory, currencyCode);
      
      setIsTyping(false);

      const hasAction = data.response.includes('✅') || data.rawResponse.includes('[ACTION:');
      
      const needsVisualization = 
        messageText.toLowerCase().includes('spending') || 
        messageText.toLowerCase().includes('budget') ||
        messageText.toLowerCase().includes('breakdown') ||
        messageText.toLowerCase().includes('summary') ||
        messageText.toLowerCase().includes('show me') ||
        messageText.toLowerCase().includes('visualize') ||
        messageText.toLowerCase().includes('chart') ||
        messageText.toLowerCase().includes('graph') ||
        data.response.includes('$') ||
        hasAction;

      const newMessage = {
        id: Date.now().toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        hasAction: hasAction,
        visualData: data.visualData || (needsVisualization ? { type: 'spending-chart', summary: true } : null),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      setMessages(prev => [...prev, newMessage]);
      saveMessage(newMessage);

      const updatedReplies = updateQuickRepliesForResponse(messageText, data.response, categoryMatch);
      setQuickReplies(updatedReplies);

    } catch (error) {
      console.error('Error in chat:', error);
      toast.error(`Sorry, I couldn't process that request: ${error.message}`);
      
      setIsTyping(false);
      const errorMessage = {
        id: Date.now().toString(),
        content: "Sorry, I'm having trouble processing your request. Please try again later.",
        isUser: false,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      
      setMessages(prev => [...prev, errorMessage]);
      saveMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    if (isLoading || !user) return;
    handleSendMessage(null, reply.action);
  };

  const initializeChat = async () => {
    setIsConnectingToData(true);
    
    try {
      // First check if we have any existing messages in storage
      await loadChatHistory();
      
      // If we have chat history, don't show welcome message again
      if (messages.length > 0) {
        setIsConnectingToData(false);
        return;
      }
        
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
      
      setIsTyping(true);
      setTimeout(() => {
        const welcomeMessage = {
          id: '1',
          content: personalizedGreeting,
          isUser: false,
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };
        
        // Only set the message if we don't already have messages (prevent duplicates)
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
  
  const resetChat = () => {
    clearLocalStorage();
    setMessages([]);
    setHasInitialized(false);
    
    if (user) {
      // Re-initialize chat if user is signed in
      setTimeout(() => {
        initializeChat();
      }, 500);
    } else {
      // Show auth prompt for non-authenticated users
      const welcomeMessage = {
        id: '1',
        content: FINNY_MESSAGES.AUTH_PROMPT,
        isUser: false,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      setMessages([welcomeMessage]);
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    isConnectingToData,
    isTyping,
    quickReplies,
    messagesEndRef,
    handleSendMessage,
    handleQuickReply,
    oldestMessageTime,
    resetChat
  };
};
