
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
          placeholder={isAuthenticated ? "Message Finny..." : "Log in to chat with Finny"}
          value={value}
          onChange={onChange}
          className={`flex-1 ${isMobile ? 'h-12 text-base px-4' : ''}`}
          disabled={isLoading || !isAuthenticated || isConnecting}
        />
        <Button
          type="submit"
          size={isMobile ? "lg" : "icon"}
          className={`finny-button-animate bg-[#9b87f5] hover:bg-[#8674d6] ${
            isMobile ? 'h-12 px-6' : ''
          }`}
          disabled={!value.trim() || isLoading || !isAuthenticated || isConnecting}
        >
          {isLoading ? (
            <Loader2 className={`animate-spin ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
          ) : (
            <Send className={isMobile ? 'h-5 w-5' : 'h-4 w-4'} />
          )}
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
