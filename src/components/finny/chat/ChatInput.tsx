
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Android keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const windowHeight = window.innerHeight;
        const heightDiff = windowHeight - viewportHeight;
        
        // Detect keyboard open on Android
        if (heightDiff > 150) {
          setKeyboardHeight(heightDiff);
          document.body.classList.add('android-keyboard-open');
          
          // Scroll input into view on Android
          setTimeout(() => {
            if (containerRef.current && isFocused) {
              containerRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'end',
                inline: 'nearest'
              });
            }
          }, 100);
        } else {
          setKeyboardHeight(0);
          document.body.classList.remove('android-keyboard-open');
        }
      }
    };

    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
        document.body.classList.remove('android-keyboard-open');
      };
    }
  }, [isFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled || isLoading || !isAuthenticated) return;
    onSubmit(e);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Add class to body for Android keyboard handling
    document.body.classList.add('finny-input-focused');
  };

  const handleBlur = () => {
    setIsFocused(false);
    document.body.classList.remove('finny-input-focused');
  };

  const canSend = value.trim() && !disabled && !isLoading && isAuthenticated;

  return (
    <div 
      ref={containerRef}
      className={`
        android-input-fix keyboard-avoid
        ${keyboardHeight > 0 ? 'keyboard-focused' : ''}
      `}
      style={{
        paddingBottom: keyboardHeight > 0 ? `${Math.max(keyboardHeight - 100, 0)}px` : undefined
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className={`
          flex items-center gap-2 p-2 rounded-lg border transition-colors
          ${isFocused 
            ? 'border-blue-500 bg-white dark:bg-gray-800' 
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
          />
          
          <Button
            type="submit"
            size="sm"
            disabled={!canSend}
            className={`
              w-8 h-8 p-0 rounded-md
              ${canSend 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
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
