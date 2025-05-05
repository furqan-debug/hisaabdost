import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  isAuthenticated?: boolean;
  isConnecting?: boolean;
}
const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = 'Message Finny...',
  isLoading,
  isAuthenticated,
  isConnecting
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Calculate final disabled state
  const isDisabled = disabled || isLoading || isConnecting || !isAuthenticated;

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  return <div className="finny-chat-input my-[9px]">
      <form onSubmit={onSubmit} className="finny-chat-input-container px-[2px] my-[3px] py-[7px]">
        <input type="text" ref={inputRef} value={value} onChange={onChange} disabled={isDisabled} className="w-full" placeholder={isConnecting ? 'Connecting...' : isAuthenticated ? placeholder : 'Please log in to chat...'} />
        <Button type="submit" size="icon" disabled={isDisabled || !value.trim()} className="rounded-full h-10 w-10 bg-green-500 hover:bg-green-600 text-white py-0 px-[9px]">
          <SendHorizontal size={18} className="py-0" />
        </Button>
      </form>
    </div>;
};
export default ChatInput;