
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
  placeholder = 'Ask Finny anything...',
  isLoading,
  isAuthenticated,
  isConnecting
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  const currencySymbol = getCurrencyByCode(currencyCode).symbol;
  const [isFocused, setIsFocused] = useState(false);

  const isDisabled = disabled || isLoading || isConnecting || !isAuthenticated;

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
    <div className="bg-slate-900/70 backdrop-blur-lg border-t border-slate-700/50 px-3 sm:px-4 py-2.5 sm:py-3 safe-area-bottom">
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
            className={`w-full text-sm bg-slate-800 text-slate-100 border-2 border-slate-700
              focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300
              py-2.5 sm:py-3 px-4 sm:px-5 rounded-full placeholder:text-slate-400 font-medium
              ${isFocused ? 'shadow-lg border-blue-500' : 'hover:border-slate-600'}
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            placeholder={getPlaceholderText()}
          />
          
          {isFocused && !isDisabled && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Sparkles size={16} className="text-blue-400 animate-pulse" />
            </div>
          )}
          
          {isLoading && (
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          size="icon" 
          disabled={isDisabled || !value.trim()} 
          className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full h-10 w-10 sm:h-11 sm:w-11 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex-shrink-0"
          title="Send message"
        >
          <SendHorizontal size={20} className="sm:w-5 sm:h-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
