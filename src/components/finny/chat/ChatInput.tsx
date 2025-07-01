
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const canSend = value.trim() && !disabled && !isLoading && isAuthenticated;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className={`
        relative flex items-center gap-2 p-2 rounded-2xl border-2 transition-all duration-200
        ${isFocused 
          ? 'border-violet-400 bg-white dark:bg-gray-800 shadow-lg shadow-violet-100 dark:shadow-violet-900/20' 
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
        }
      `}>
        {/* Input field */}
        <Input
          ref={inputRef}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled || !isAuthenticated}
          placeholder={placeholder}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
        
        {/* Send button */}
        <motion.div
          whileHover={{ scale: canSend ? 1.05 : 1 }}
          whileTap={{ scale: canSend ? 0.95 : 1 }}
        >
          <Button
            type="submit"
            size="sm"
            disabled={!canSend}
            className={`
              w-8 h-8 p-0 rounded-xl transition-all duration-200
              ${canSend 
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg' 
                : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
              }
            `}
          >
            {isLoading || isConnecting ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </Button>
        </motion.div>
      </div>
      
      {/* Status indicator */}
      {isConnecting && (
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse delay-200"></div>
          </div>
          <span>Connecting to advanced AI...</span>
        </div>
      )}
    </form>
  );
};

export default ChatInput;
