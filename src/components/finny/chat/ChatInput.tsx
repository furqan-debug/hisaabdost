
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = 'Message Finny...'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  return (
    <div className="finny-chat-input">
      <form onSubmit={onSubmit} className="finny-chat-input-container">
        <input
          type="text"
          ref={inputRef}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full"
          placeholder={placeholder}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={disabled || !value.trim()} 
          className="rounded-full h-10 w-10 bg-green-500 hover:bg-green-600 text-white"
        >
          <SendHorizontal size={18} />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
