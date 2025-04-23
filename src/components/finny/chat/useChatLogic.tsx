import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { Message, QuickReply } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  PieChart, 
  BarChart3, 
  Plus, 
  Calendar, 
  DollarSign, 
  Info, 
  ArrowRight, 
  PiggyBank 
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  { text: "Spending summary", action: "Show me a summary of my recent spending", icon: <PieChart size={14} /> },
  { text: "Budget advice", action: "I need advice for creating a budget", icon: <DollarSign size={14} /> },
  { text: "Add expense", action: "I want to add a new expense", icon: <Plus size={14} /> },
  { text: "Set a goal", action: "I'd like to set a savings goal", icon: <PiggyBank size={14} /> }
];

const FINNY_GREETING = "Hi there! 👋 I'm Finny, your personal finance assistant. I can help you track expenses, set budgets, manage goals, and more. How can I help you today?";
const FINNY_AUTH_PROMPT = "I'll need you to log in first so I can access your personal financial information.";
const FINNY_CONNECTING = "Connecting to your financial data...";

const CATEGORY_PATTERN = /show my (\w+) (spending|expenses|breakdown)/i;
const SUMMARY_PATTERN = /(show|get|give) (me )?(a )?(summary|overview|report|analysis)/i;

export const useChatLogic = (queuedMessage: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectingToData, setIsConnectingToData] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(DEFAULT_QUICK_REPLIES);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (user) {
      setIsConnectingToData(true);
      
      const fetchUserData = async () => {
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
          
          let personalizedGreeting = FINNY_GREETING;
          
          if (monthlyExpenses && monthlyExpenses.length > 0) {
            const categoryTotals: {[key: string]: number} = {};
            monthlyExpenses.forEach(exp => {
              categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
            });
            
            const topCategory = Object.entries(categoryTotals)
              .sort((a, b) => b[1] - a[1])[0];
            
            const userName = user?.user_metadata?.full_name || '';
            personalizedGreeting = `Hey ${userName}! 🎉 Finny here to help with your finances.\nLooks like you've spent ${formatCurrency(totalMonthlySpending)} this month. ${topCategory[0]} took ${formatCurrency(topCategory[1])} — shall we explore ways to save? 🧠`;
            
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
            setMessages([{
              id: '1',
              content: personalizedGreeting,
              isUser: false,
              timestamp: new Date(),
            }]);
            setIsTyping(false);
          }, 1500);
          
        } catch (error) {
          console.error('Error fetching user data:', error);
          setMessages([{
            id: '1',
            content: "I've connected to your account, but I'm having trouble retrieving your latest financial data. How can I help you today?",
            isUser: false,
            timestamp: new Date(),
          }]);
        } finally {
          setIsConnectingToData(false);
        }
      };
      
      fetchUserData();
    } else {
      setMessages([{
        id: '1',
        content: FINNY_AUTH_PROMPT,
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, [user]);

  const handleSendMessage = async (e: React.FormEvent | null, customMessage?: string) => {
    if (e) e.preventDefault();
    
    const messageToSend = customMessage || newMessage;
    
    if (!messageToSend.trim() || isLoading) return;
    
    if (!user) {
      toast.error("Please log in to chat with Finny");
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      content: messageToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const recentMessages = [...messages.slice(-5), userMessage];
      
      const categoryMatch = messageToSend.match(CATEGORY_PATTERN);
      const summaryMatch = messageToSend.match(SUMMARY_PATTERN);
      
      console.log("Message analysis:", { 
        message: messageToSend,
        categoryMatch,
        summaryMatch
      });

      const { data, error } = await supabase.functions.invoke('finny-chat', {
        body: {
          message: messageToSend,
          userId: user.id,
          chatHistory: recentMessages,
          analysisType: categoryMatch ? 'category' : (summaryMatch ? 'summary' : 'general'),
          specificCategory: categoryMatch ? categoryMatch[1] : null
        },
      });

      if (error) {
        console.error('Error calling Finny:', error);
        throw new Error(`Failed to get response: ${error.message}`);
      }

      setIsTyping(false);
      
      const hasAction = data.response.includes('✅') || data.rawResponse.includes('[ACTION:');
      
      const needsVisualization = messageToSend.toLowerCase().includes('spending') || 
                               messageToSend.toLowerCase().includes('budget') ||
                               messageToSend.toLowerCase().includes('breakdown');

      const newMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        hasAction: hasAction,
      };
      
      if (data.visualData) {
        newMessage.visualData = data.visualData;
      }
      else if (needsVisualization && categoryMatch) {
        newMessage.visualData = { 
          type: 'category-chart',
          category: categoryMatch[1]
        };
      }
      else if (needsVisualization && summaryMatch) {
        newMessage.visualData = { type: 'spending-chart' };
      }

      setMessages((prev) => [...prev, newMessage]);
      
      let updatedReplies: QuickReply[] = [...DEFAULT_QUICK_REPLIES];
      
      if (data.response.toLowerCase().includes('budget')) {
        updatedReplies = [
          { text: "Show my budget", action: "Show me my budget", icon: <PieChart size={14} /> },
          { text: "Update budget", action: "I'd like to update my budget", icon: <Plus size={14} /> },
          { text: "Budget analysis", action: "How am I doing with my budgets this month?", icon: <BarChart3 size={14} /> },
          { text: "Add expense", action: "I want to add a new expense", icon: <Plus size={14} /> }
        ];
      } else if (data.response.toLowerCase().includes('expense')) {
        updatedReplies = [
          { text: "Add expense", action: "I want to add an expense", icon: <Plus size={14} /> },
          { text: "Recent expenses", action: "Show my recent expenses", icon: <Calendar size={14} /> },
          { text: "Category analysis", action: "Show my spending by category", icon: <PieChart size={14} /> },
          { text: "Monthly total", action: "What's my total spending this month?", icon: <DollarSign size={14} /> }
        ];
      } else if (categoryMatch) {
        updatedReplies = [
          { text: "All categories", action: "Show my spending by category", icon: <PieChart size={14} /> },
          { text: `Add ${categoryMatch[1]}`, action: `Add a ${categoryMatch[1]} expense`, icon: <Plus size={14} /> },
          { text: "Monthly spending", action: "What's my total spending this month?", icon: <DollarSign size={14} /> },
          { text: "Spending insights", action: "Give me insights on my spending", icon: <Info size={14} /> }
        ];
      } else if (data.response.toLowerCase().includes('goal')) {
        updatedReplies = [
          { text: "Progress update", action: "What's my progress on my goals?", icon: <PiggyBank size={14} /> },
          { text: "Set new goal", action: "I want to set a new savings goal", icon: <Plus size={14} /> },
          { text: "Update goal", action: "How can I update my goal progress?", icon: <ArrowRight size={14} /> },
          { text: "Budget advice", action: "How can I save more money?", icon: <DollarSign size={14} /> }
        ];
      }
      
      setQuickReplies(updatedReplies);
      
    } catch (error) {
      console.error('Error in chat:', error);
      toast.error(`Sorry, I couldn't process that request: ${error.message}`);
      
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "Sorry, I'm having trouble processing your request. Please try again later.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    if (isLoading || !user) return;
    
    setNewMessage(reply.action);
    
    handleSendMessage(null, reply.action);
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
    handleQuickReply
  };
};
