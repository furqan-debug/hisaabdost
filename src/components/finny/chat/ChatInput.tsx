
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
    <div className="finny-chat-input keyboard-avoid">
      <form onSubmit={onSubmit} className="finny-chat-input-container">
        <div className="relative flex-1">
          <input 
            type="text" 
            ref={inputRef} 
            value={value} 
            onChange={onChange} 
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={isDisabled} 
            className={`w-full transition-all duration-300 ${
              isFocused ? 'shadow-lg transform scale-[1.02]' : ''
            }`}
            placeholder={getPlaceholderText()}
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="flex gap-1">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Attachment button (future feature) */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
            disabled={isDisabled}
            title="Attach file (coming soon)"
          >
            <Paperclip size={16} />
          </Button>

          {/* Voice input button (future feature) */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
            disabled={isDisabled}
            title="Voice input (coming soon)"
          >
            <Mic size={16} />
          </Button>

          {/* Send button */}
          <Button 
            type="submit" 
            size="icon" 
            disabled={isDisabled || !value.trim()} 
            className="finny-send-button"
            title="Send message"
          >
            <SendHorizontal size={18} />
          </Button>
        </div>
      </form>

      {/* Input hints */}
      {isAuthenticated && !isLoading && !isConnecting && (
        <div className="text-xs text-gray-400 text-center mt-2 px-4">
          <span>Try: "Add $50 food expense" or "Show my budget summary"</span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
