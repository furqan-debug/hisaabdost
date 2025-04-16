
import React from 'react';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import ChatHeader from './chat/ChatHeader';
import ChatInput from './chat/ChatInput';
import FinnyMessage from './chat/FinnyMessage';
import QuickReplies from './chat/QuickReplies';
import { useChatLogic } from './chat/useChatLogic';

interface FinnyChatProps {
  isOpen: boolean;
  onClose: () => void;
  config?: {
    initialMessages?: Message[];
  }
}

const FinnyChat = ({ isOpen, onClose, config }: FinnyChatProps) => {
  const { user } = useAuth();
  const {
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
  } = useChatLogic(null);

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
            <ChatHeader />
            
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
                    <div className="absolute inset-0 rounded-full animate-pulse bg-[#9b87f5]/20" />
                    <Loader2 className="absolute inset-0 w-12 h-12 animate-spin text-[#9b87f5]" />
                  </div>
                  <span className="text-sm text-muted-foreground">Connecting to your financial data...</span>
                </div>
              )}
              
              {messages.map((message) => (
                <FinnyMessage
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  hasAction={message.hasAction}
                  visualData={message.visualData}
                />
              ))}
              
              {!isLoading && !isTyping && messages.length > 0 && !messages[messages.length - 1].isUser && (
                <QuickReplies
                  replies={quickReplies}
                  onSelect={handleQuickReply}
                  isLoading={isLoading}
                  isAuthenticated={!!user}
                />
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <ChatInput
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onSubmit={handleSendMessage}
              isLoading={isLoading}
              isAuthenticated={!!user}
              isConnecting={isConnectingToData}
            />
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FinnyChat;
