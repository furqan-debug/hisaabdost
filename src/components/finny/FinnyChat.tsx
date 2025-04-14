
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Info, MessageCircleHeart, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FinnyMessage from './FinnyMessage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface QuickReply {
  text: string;
  action: string;
}

interface FinnyConfig {
  initialMessages?: Message[];
}

const FINNY_GREETING = "Hi there! 👋 I'm Finny, your personal finance assistant. I can help you track expenses, set budgets, manage goals, and more. How can I help you today?";
const FINNY_AUTH_PROMPT = "I'll need you to log in first so I can access your personal financial information.";
const FINNY_CONNECTING = "Connecting to your financial data...";

// Default quick reply suggestions
const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  { text: "Show my spending summary", action: "Show me a summary of my recent spending" },
  { text: "Budget advice", action: "Do you have any budget advice for me?" },
  { text: "How to save money", action: "How can I save more money?" },
  { text: "Set a savings goal", action: "I want to set a savings goal" }
];

const FinnyChat: React.FC<{ isOpen: boolean; onClose: () => void; config?: FinnyConfig }> = ({ 
  isOpen, 
  onClose,
  config
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectingToData, setIsConnectingToData] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(DEFAULT_QUICK_REPLIES);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setIsConnectingToData(true);
      
      // Fetch user's financial data to provide context for Finny
      const fetchUserData = async () => {
        try {
          const { data: expenses, error: expensesError } = await supabase
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
          
          // Prepare a personalized greeting based on user's data
          let personalizedGreeting = FINNY_GREETING;
          
          if (expenses && expenses.length > 0) {
            const lastExpense = expenses[0];
            const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
            
            personalizedGreeting = `Hi there! 👋 I'm Finny, your personal finance assistant. I see you've spent $${totalExpenses.toFixed(2)} recently, with your latest expense being $${Number(lastExpense.amount).toFixed(2)} for ${lastExpense.category}. How can I help you manage your finances today?`;
            
            // Set personalized quick replies based on expenses
            const spentCategories = [...new Set(expenses.map(exp => exp.category))];
            if (spentCategories.length > 0) {
              const categoryReplies = spentCategories.slice(0, 2).map(category => ({
                text: `${category} spending`,
                action: `Show my ${category.toLowerCase()} expenses`
              }));
              setQuickReplies([...categoryReplies, ...DEFAULT_QUICK_REPLIES.slice(0, 2)]);
            }
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
    } else if (config?.initialMessages) {
      setMessages(config.initialMessages);
    } else {
      setMessages([{
        id: '1',
        content: FINNY_AUTH_PROMPT,
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, [user, config]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current && !isLoading && user) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isLoading, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isLoading) return;
    
    if (!user) {
      toast.error("Please log in to chat with Finny");
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      content: newMessage,
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
          message: newMessage,
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
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: data.response,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      
      // Generate new quick replies based on the context
      if (data.response.toLowerCase().includes('budget')) {
        setQuickReplies([
          { text: "Show my budget", action: "Show me my budget" },
          { text: "Create budget", action: "How do I create a budget?" },
          ...DEFAULT_QUICK_REPLIES.slice(0, 2)
        ]);
      } else if (data.response.toLowerCase().includes('expense')) {
        setQuickReplies([
          { text: "Add expense", action: "I want to add an expense" },
          { text: "Recent expenses", action: "Show my recent expenses" },
          ...DEFAULT_QUICK_REPLIES.slice(0, 2)
        ]);
      }
      
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
    setNewMessage(reply.action);
    // Add a small delay to make it feel more natural
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed bottom-20 right-4 md:bottom-24 md:right-8 z-40 w-[90vw] sm:w-[400px] shadow-lg"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <Card className="finny-chat-card">
            <div className="finny-chat-header">
              <div className="finny-chat-title">
                <MessageCircleHeart size={20} className="text-[#9b87f5]" />
                <span className="text-[#9b87f5] font-semibold">Finny</span>
                <Badge className="finny-chat-badge ml-1">Assistant</Badge>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      className="rounded-full hover:bg-muted/80"
                      aria-label="Finny Help"
                    >
                      <HelpCircle size={16} className="text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs">Ask Finny about your finances, budgets, and money tips!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="h-[50vh] overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {!user && (
                <Alert variant="default" className="mb-4 bg-muted/50 border-primary/20">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm">
                    You need to log in to use Finny's personalized features.
                  </AlertDescription>
                </Alert>
              )}
              
              {isConnectingToData && user && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="relative w-12 h-12">
                    <Skeleton className="absolute inset-0 rounded-full animate-pulse bg-[#9b87f5]/20" />
                    <Loader2 className="absolute inset-0 w-12 h-12 animate-spin text-[#9b87f5]" />
                  </div>
                  <span className="text-sm text-muted-foreground">{FINNY_CONNECTING}</span>
                </div>
              )}
              
              {messages.map((message) => (
                <FinnyMessage
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
              
              {isTyping && !isConnectingToData && (
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 bg-[#9b87f5]">
                    <span className="text-xs font-semibold text-white">F</span>
                  </Avatar>
                  <div className="bg-[#f8f5ff] dark:bg-[#2a2438] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <div className="typing-indicator">
                      <span className="typing-indicator-dot"></span>
                      <span className="typing-indicator-dot"></span>
                      <span className="typing-indicator-dot"></span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quick reply buttons */}
              {!isLoading && !isTyping && messages.length > 0 && !messages[messages.length - 1].isUser && (
                <div className="quick-reply-container">
                  {quickReplies.map((reply, index) => (
                    <button 
                      key={index} 
                      className="quick-reply-button"
                      onClick={() => handleQuickReply(reply)}
                    >
                      {reply.text}
                    </button>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
              
              {isLoading && !isTyping && (
                <div className="flex justify-center my-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#9b87f5]" />
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="finny-chat-input"
            >
              <div className="finny-chat-input-container">
                <Input
                  type="text"
                  placeholder={user ? "Message Finny..." : "Log in to chat with Finny"}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  disabled={isLoading || !user || isConnectingToData}
                  ref={inputRef}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="finny-button-animate bg-[#9b87f5] hover:bg-[#8674d6]"
                  disabled={!newMessage.trim() || isLoading || !user || isConnectingToData}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FinnyChat;
