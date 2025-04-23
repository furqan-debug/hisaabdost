
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConnecting: boolean;
}

const ChatInput = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  isAuthenticated,
  isConnecting
}: ChatInputProps) => {
  const isMobile = useIsMobile();
  
  return (
    <form onSubmit={onSubmit} className="finny-chat-input">
      <div className="finny-chat-input-container">
        <Input 
          type="text" 
          placeholder={isAuthenticated ? "Message Finny..." : "Log in to chat with Finny ✨"} 
          value={value} 
          onChange={onChange} 
          disabled={isLoading || !isAuthenticated || isConnecting}
          className="h-11 text-sm rounded-full shadow-sm border-muted bg-background/80 backdrop-blur-sm focus-visible:ring-offset-0"
        />
        <Button 
          type="submit" 
          size="icon"
          className="h-11 w-11 rounded-full shadow-sm hover:shadow-md transition-all" 
          disabled={!value.trim() || isLoading || !isAuthenticated || isConnecting}
        >
          {isLoading ? 
            <Loader2 className="h-5 w-5 animate-spin" /> : 
            <Send className="h-5 w-5" />
          }
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
