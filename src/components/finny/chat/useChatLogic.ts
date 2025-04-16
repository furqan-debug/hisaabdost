
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
  { text: "Budget advice", action: "Set a budget for groceries of $300", icon: <DollarSign size={14} /> },
  { text: "Add expense", action: "Add an expense of $45 for dinner yesterday", icon: <Plus size={14} /> },
  { text: "Set a goal", action: "I want to set a savings goal of $5000 for vacation", icon: <PiggyBank size={14} /> }
];

const FINNY_GREETING = "Hi there! 👋 I'm Finny, your personal finance assistant. I can help you track expenses, set budgets, manage goals, and more. How can I help you today?";
const FINNY_AUTH_PROMPT = "I'll need you to log in first so I can access your personal financial information.";
const FINNY_CONNECTING = "Connecting to your financial data...";

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
      
      // Fetch user's financial data to provide context for Finny
      const fetchUserData = async () => {
        try {
          // Get current month range
          const now = new Date();
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
          
          // Get expenses for current month
          const { data: monthlyExpenses, error: monthlyError } = await supabase
            .from('expenses')
            .select('amount, category')
            .eq('user_id', user.id)
            .gte('date', firstDayOfMonth)
            .lte('date', lastDayOfMonth);
            
          if (monthlyError) throw monthlyError;
          
          // Get latest 5 expenses
          const { data: recentExpenses, error: expensesError } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(5);
            
          if (expensesError) throw expensesError;
          
          // Get active budgets
          const { data: budgets, error: budgetsError } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', user.id);
            
          if (budgetsError) throw budgetsError;
          
          // Calculate monthly spending
          const totalMonthlySpending = monthlyExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
          
          // Generate personalized greeting
          let personalizedGreeting = FINNY_GREETING;
          
          if (monthlyExpenses && monthlyExpenses.length > 0) {
            // Get top spending category
            const categoryTotals: {[key: string]: number} = {};
            monthlyExpenses.forEach(exp => {
              categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
            });
            
            const topCategory = Object.entries(categoryTotals)
              .sort((a, b) => b[1] - a[1])[0];
            
            personalizedGreeting = `Hi there! 👋 I'm Finny, your personal finance assistant. I see you've spent ${formatCurrency(totalMonthlySpending)} this month, with ${formatCurrency(topCategory[1])} on ${topCategory[0]}. How can I help with your finances today?`;
            
            // Generate context-aware quick replies
            let contextReplies: QuickReply[] = [];
            
            // Add top category analysis
            contextReplies.push({
              text: `${topCategory[0]} analysis`,
              action: `Show my ${topCategory[0].toLowerCase()} spending breakdown`,
              icon: <BarChart3 size={14} />
            });
            
            // Check if budget exceeded
            if (budgets && budgets.length > 0) {
              const budgetByCategory: {[key: string]: number} = {};
              budgets.forEach(budget => {
                budgetByCategory[budget.category] = budget.amount;
              });
              
              for (const [category, spent] of Object.entries(categoryTotals)) {
                if (budgetByCategory[category] && spent > budgetByCategory[category]) {
                  contextReplies.push({
                    text: `${category} budget alert`,
                    action: `Update my ${category.toLowerCase()} budget`,
                    icon: <Info size={14} />
                  });
                  break; // Just add one budget alert
                }
              }
            }
            
            // If recent expense exists, offer to add similar
            if (recentExpenses && recentExpenses.length > 0) {
              const latestExpense = recentExpenses[0];
              contextReplies.push({
                text: `Add ${latestExpense.category}`,
                action: `Add a new ${latestExpense.category.toLowerCase()} expense`,
                icon: <Plus size={14} />
              });
            }
            
            // Mix contextual and default replies
            setQuickReplies([
              ...contextReplies.slice(0, 2),
              ...DEFAULT_QUICK_REPLIES.slice(0, 2)
            ]);
          }
          
          // Add a typing effect
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
    
    // Use either provided custom message (from quick replies) or input field value
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
    // Show typing indicator
    setIsTyping(true);

    try {
      const recentMessages = [...messages.slice(-5), userMessage];

      const { data, error } = await supabase.functions.invoke('finny-chat', {
        body: {
          message: messageToSend,
          userId: user.id,
          chatHistory: recentMessages
        },
      });

      if (error) {
        console.error('Error calling Finny:', error);
        throw new Error(`Failed to get response: ${error.message}`);
      }

      // Hide typing indicator and show actual message
      setIsTyping(false);
      
      // Detect if response contains an action (was performed)
      const hasAction = data.response.includes('✅') || data.rawResponse.includes('[ACTION:');

      // Check for potential visualization triggers
      const newMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        hasAction: hasAction,
      };
      
      // Add visual data if needed (spending summary, charts, etc.)
      if (messageToSend.toLowerCase().includes('spending summary') || 
          messageToSend.toLowerCase().includes('spend breakdown') ||
          messageToSend.toLowerCase().includes('spending analysis')) {
        // We'll add chart data visualization in a future iteration
        // For now, we'll mark it for UI treatment
        newMessage.visualData = { type: 'spending-chart' };
      }

      setMessages((prev) => [...prev, newMessage]);
      
      // Generate new quick replies based on the context
      let updatedReplies: QuickReply[] = [...DEFAULT_QUICK_REPLIES];
      
      if (data.response.toLowerCase().includes('budget')) {
        updatedReplies = [
          { text: "Show my budget", action: "Show me my budget", icon: <PieChart size={14} /> },
          { text: "Update budget", action: "I want to increase my groceries budget by $50", icon: <Plus size={14} /> },
          { text: "Budget analysis", action: "How am I doing with my budgets this month?", icon: <BarChart3 size={14} /> },
          { text: "Add expense", action: "Add a new expense", icon: <Plus size={14} /> }
        ];
      } else if (data.response.toLowerCase().includes('expense')) {
        updatedReplies = [
          { text: "Add expense", action: "I want to add an expense", icon: <Plus size={14} /> },
          { text: "Recent expenses", action: "Show my recent expenses", icon: <Calendar size={14} /> },
          { text: "Category analysis", action: "Show my spending by category", icon: <PieChart size={14} /> },
          { text: "Monthly total", action: "What's my total spending this month?", icon: <DollarSign size={14} /> }
        ];
      } else if (data.response.toLowerCase().includes('goal')) {
        updatedReplies = [
          { text: "Progress update", action: "What's my progress on my goals?", icon: <PiggyBank size={14} /> },
          { text: "Set new goal", action: "I want to set a new savings goal", icon: <Plus size={14} /> },
          { text: "Update goal", action: "Update my vacation goal progress", icon: <ArrowRight size={14} /> },
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
    
    // Either auto-send or wait for user to press send
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
