
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomKeyboard from './CustomKeyboard';
import { useCustomKeyboard } from './hooks/useCustomKeyboard';

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
  // Load custom keyboard preference from localStorage
  const [useCustomKeyboardMode, setUseCustomKeyboardMode] = useState(() => {
    const saved = localStorage.getItem('finny-use-custom-keyboard');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Custom keyboard hook
  const {
    isKeyboardVisible,
    inputValue,
    inputRef,
    showKeyboard,
    hideKeyboard,
    handleKeyPress,
    handleBackspace,
    handleEnter,
    updateInputValue
  } = useCustomKeyboard();

  // Sync custom keyboard input with parent component
  useEffect(() => {
    updateInputValue(value);
  }, [value, updateInputValue]);

  // Handle input change - update both custom keyboard and parent
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    updateInputValue(newValue);
    onChange(e);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valueToSubmit = useCustomKeyboardMode ? inputValue : value;
    if (!valueToSubmit.trim() || disabled || isLoading || !isAuthenticated) return;
    onSubmit(e);
    if (useCustomKeyboardMode) {
      updateInputValue(''); // Clear custom keyboard input
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    document.body.classList.add('finny-input-focused');
    
    if (useCustomKeyboardMode) {
      // Show custom keyboard instead of native
      showKeyboard();
      // Prevent native keyboard
      if (inputRef.current) {
        inputRef.current.setAttribute('readonly', 'true');
        setTimeout(() => {
          inputRef.current?.removeAttribute('readonly');
        }, 100);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    document.body.classList.remove('finny-input-focused');
  };

  // Handle custom keyboard actions
  const handleCustomKeyboardEnter = () => {
    // Create a synthetic form event
    const form = inputRef.current?.closest('form');
    if (form) {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'target', { value: form, enumerable: true });
      handleSubmit(event as any);
    }
  };

  const canSend = (useCustomKeyboardMode ? inputValue.trim() : value.trim()) && !disabled && !isLoading && isAuthenticated;

  return (
    <>
      <div 
        ref={containerRef}
        className={`
          finny-chat-input-container relative w-full
          ${isKeyboardVisible && useCustomKeyboardMode ? 'custom-keyboard-active' : ''}
          ${isFocused ? 'input-focused' : ''}
        `}
        style={{
          transform: isKeyboardVisible && useCustomKeyboardMode ? 'translateY(-320px)' : 'translateY(0)',
          transition: 'transform 0.3s ease-out',
          zIndex: 50
        }}
      >
      <form onSubmit={handleSubmit} className="w-full">
        <div className={`
          flex items-center gap-2 p-3 rounded-xl border transition-all duration-200
          ${isFocused 
            ? 'border-primary bg-background shadow-lg' 
            : 'border-border bg-muted/50'
          }
        `}>
          <Input
            ref={inputRef}
            value={useCustomKeyboardMode ? inputValue : value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled || !isAuthenticated}
            placeholder={placeholder}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            inputMode={useCustomKeyboardMode ? "none" : "text"}
            readOnly={useCustomKeyboardMode && isKeyboardVisible}
          />
          
          <Button
            type="submit"
            size="sm"
            disabled={!canSend}
            className={`
              w-9 h-9 p-0 rounded-lg flex-shrink-0
              ${canSend 
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
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
        
        {/* Toggle between custom and native keyboard */}
        <div className="flex justify-center mt-2">
          <button
            type="button"
            onClick={() => {
              const newMode = !useCustomKeyboardMode;
              setUseCustomKeyboardMode(newMode);
              localStorage.setItem('finny-use-custom-keyboard', JSON.stringify(newMode));
              if (isKeyboardVisible) hideKeyboard();
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {useCustomKeyboardMode ? 'Use system keyboard' : 'Use custom keyboard'}
          </button>
        </div>
      </form>
      </div>

      {/* Custom Keyboard */}
      <CustomKeyboard
        isVisible={isKeyboardVisible && useCustomKeyboardMode}
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onEnter={handleCustomKeyboardEnter}
        onClose={hideKeyboard}
      />
    </>
  );
};

export default ChatInput;
