
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
    <form onSubmit={onSubmit} className="finny-chat-input px-2 py-2 border-t bg-background/95 backdrop-blur-sm">
      <div className="finny-chat-input-container flex items-center gap-2">
        <Input 
          type="text" 
          placeholder={isAuthenticated ? "Message Finny..." : "Log in to chat with Finny"} 
          value={value} 
          onChange={onChange} 
          disabled={isLoading || !isAuthenticated || isConnecting} 
          className="h-8 text-xs"
        />
        <Button 
          type="submit" 
          size="icon-sm"
          className="h-8 w-8 bg-primary hover:bg-primary/90" 
          disabled={!value.trim() || isLoading || !isAuthenticated || isConnecting}
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
