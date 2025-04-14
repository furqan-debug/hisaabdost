import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FinnyMessage from './FinnyMessage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

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

const FinnyChat: React.FC<{ isOpen: boolean; onClose: () => void; config?: FinnyConfig }> = ({ 
  isOpen, 
  onClose,
  config
}) => {
  const [messages, setMessages] = useState<Message[]>(
    config?.initialMessages || [
      {
        id: '1',
        content: FINNY_GREETING,
        isUser: false,
        timestamp: new Date(),
      },
    ]
  );
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isLoading) return;
    
    // Check if user is logged in
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
      // Get the last few messages for context (up to 5)
      const recentMessages = [...messages.slice(-5), userMessage];

      // Call the Supabase Edge Function
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

      // Add Finny's response to the chat
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
      
      // Add an error message
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
                  placeholder="Message Finny..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="finny-button-animate"
                  disabled={!newMessage.trim() || isLoading}
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
