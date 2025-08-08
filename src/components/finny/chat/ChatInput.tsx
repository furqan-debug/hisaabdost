
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  isLoading?: boolean;
  isAuthenticated?: boolean;
  isConnecting?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isLoading = false,
  isAuthenticated = false,
  isConnecting = false,
  placeholder = "Type your message...",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled || isLoading || !isAuthenticated) return;
    onSubmit(e);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const canSend = value.trim() && !disabled && !isLoading && isAuthenticated;

  return (
    <div className="finny-chat-input-container">
      <form onSubmit={handleSubmit} className="w-full">
        <div className={`
          flex items-center gap-2 p-3 rounded-xl border transition-all duration-200
          ${isFocused 
            ? 'border-blue-500 bg-white dark:bg-gray-800 shadow-lg' 
            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
          }
        `}>
          <Input
            ref={inputRef}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled || !isAuthenticated}
            placeholder={placeholder}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
          />
          
          <Button
            type="submit"
            size="sm"
            disabled={!canSend}
            className={`
              w-9 h-9 p-0 rounded-lg flex-shrink-0
              ${canSend 
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isLoading || isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
