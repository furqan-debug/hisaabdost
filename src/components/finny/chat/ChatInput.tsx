
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Sparkles } from 'lucide-react';
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
  placeholder = 'Ask Finny anything about your finances...',
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
    <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200/50 px-3 sm:px-6 py-3 sm:py-4 backdrop-blur-sm safe-area-bottom">
      <form onSubmit={onSubmit} className="flex gap-2 sm:gap-3 items-center max-w-4xl mx-auto">
        <div className="relative flex-1 min-w-0">
          <input 
            type="text" 
            ref={inputRef} 
            value={value} 
            onChange={onChange} 
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={isDisabled} 
            className={`w-full text-xs sm:text-sm bg-white text-gray-900 border-2 border-gray-200
              focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300
              py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl placeholder:text-gray-500 font-medium shadow-sm
              ${isFocused ? 'shadow-lg bg-white border-blue-500' : 'hover:border-gray-300'}
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            placeholder={getPlaceholderText()}
          />
          
          {/* Sparkle decoration when focused */}
          {isFocused && !isDisabled && (
            <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
              <Sparkles size={14} className="sm:w-4 sm:h-4 text-blue-500 animate-pulse" />
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Send button */}
        <Button 
          type="submit" 
          size="icon" 
          disabled={isDisabled || !value.trim()} 
          className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl h-10 w-10 sm:h-12 sm:w-12 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ring-2 ring-blue-500/20 flex-shrink-0"
          title="Send message"
        >
          <SendHorizontal size={16} className="sm:w-5 sm:h-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
