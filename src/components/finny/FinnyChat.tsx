
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FinnyMessage from './FinnyMessage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface FinnyConfig {
  initialMessages?: Message[];
}

const FINNY_GREETING = "Hi there! 👋 I'm Finny, your personal finance assistant. I can help you track expenses, set budgets, manage goals, and more. How can I help you today?";
const FINNY_AUTH_PROMPT = "I'll need you to log in first so I can access your personal financial information.";
const FINNY_CONNECTING = "Connecting to your financial data...";

const FinnyChat: React.FC<{ isOpen: boolean; onClose: () => void; config?: FinnyConfig }> = ({ 
  isOpen, 
  onClose,
  config
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectingToData, setIsConnectingToData] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          }
          
          setMessages([{
            id: '1',
            content: personalizedGreeting,
            isUser: false,
            timestamp: new Date(),
          }]);
          
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
  }, [messages]);

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

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: data.response,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error in chat:', error);
      toast.error(`Sorry, I couldn't process that request: ${error.message}`);
      
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
                <span className="text-primary font-semibold">Finny</span>
                <span className="finny-chat-badge">Assistant</span>
              </div>
            </div>
            
            <div className="h-[50vh] overflow-y-auto p-4 space-y-4">
              {!user && (
                <Alert variant="default" className="mb-4 bg-muted/50 border-primary/20">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm">
                    You need to log in to use Finny's personalized features.
                  </AlertDescription>
                </Alert>
              )}
              
              {isConnectingToData && user && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
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
              <div ref={messagesEndRef} />
              {isLoading && (
                <div className="flex justify-center my-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
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
                />
                <Button
                  type="submit"
                  size="icon"
                  className="finny-button-animate"
                  disabled={!newMessage.trim() || isLoading || !user || isConnectingToData}
                >
                  <Send className="h-4 w-4" />
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
