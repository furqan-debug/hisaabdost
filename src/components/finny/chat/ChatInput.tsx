import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Mic, Paperclip } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrency } from '@/hooks/use-currency';
import { getCurrencyByCode } from '@/utils/currencyUtils';

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
  const { currencyCode } = useCurrency();
  const currencySymbol = getCurrencyByCode(currencyCode).symbol;
  const [isFocused, setIsFocused] = useState(false);

  // Calculate final disabled state
  const isDisabled = disabled || isLoading || isConnecting || !isAuthenticated;

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [isMobile]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const getPlaceholderText = () => {
    if (isConnecting) return 'Connecting to Finny...';
    if (!isAuthenticated) return 'Please log in to chat with Finny';
    if (isLoading) return 'Finny is thinking...';
    return placeholder;
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border-t border-gray-100 px-4 py-3">
      <form onSubmit={onSubmit} className="flex gap-2 items-center max-w-3xl mx-auto">
        <div className="relative flex-1">
          <input 
            type="text" 
            ref={inputRef} 
            value={value} 
            onChange={onChange} 
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={isDisabled} 
            className={`w-full text-sm bg-gray-100 text-gray-900 border border-transparent 
              focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300
              py-3 px-4 rounded-xl placeholder:text-gray-500 ${
              isFocused ? 'shadow-md bg-white' : ''
            }`}
            placeholder={getPlaceholderText()}
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center">
          <Button 
            type="submit" 
            size="icon" 
            disabled={isDisabled || !value.trim()} 
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-11 w-11 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:bg-blue-500/50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <SendHorizontal size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
