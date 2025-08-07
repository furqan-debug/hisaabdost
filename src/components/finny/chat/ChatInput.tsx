
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNativeCamera } from '@/hooks/useNativeCamera';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  isLoading?: boolean;
  isAuthenticated?: boolean;
  isConnecting?: boolean;
  placeholder?: string;
  onCameraScan?: () => void;
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
  onCameraScan,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { capturePhoto } = useNativeCamera();

  // Enhanced keyboard visibility handling
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        // Get viewport dimensions
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        const windowHeight = window.innerHeight;
        const heightDiff = windowHeight - viewportHeight;
        
        // Detect keyboard open (more sensitive detection)
        if (heightDiff > 100) {
          setKeyboardHeight(heightDiff);
          document.body.classList.add('keyboard-open');
          
          // Scroll input into view with proper timing
          setTimeout(() => {
            if (containerRef.current && isFocused) {
              containerRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'end',
                inline: 'nearest'
              });
            }
          }, 150);
        } else {
          setKeyboardHeight(0);
          document.body.classList.remove('keyboard-open');
        }
      }
    };

    // Listen to both resize and visualViewport events
    const setupListeners = () => {
      if (typeof window !== 'undefined') {
        if (window.visualViewport) {
          window.visualViewport.addEventListener('resize', handleResize);
        }
        window.addEventListener('resize', handleResize);
        
        return () => {
          if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', handleResize);
          }
          window.removeEventListener('resize', handleResize);
          document.body.classList.remove('keyboard-open');
        };
      }
    };

    return setupListeners();
  }, [isFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled || isLoading || !isAuthenticated) return;
    onSubmit(e);
  };

  const handleFocus = () => {
    setIsFocused(true);
    document.body.classList.add('finny-input-focused');
    
    // Ensure input is visible after keyboard appears
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }, 300);
  };

  const handleBlur = () => {
    setIsFocused(false);
    document.body.classList.remove('finny-input-focused');
  };

  const canSend = value.trim() && !disabled && !isLoading && isAuthenticated;

  const handleCameraClick = async () => {
    if (!isAuthenticated || disabled || isLoading) return;
    
    try {
      const file = await capturePhoto();
      if (file && onCameraScan) {
        onCameraScan();
      }
    } catch (error) {
      console.error('Camera capture error:', error);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`
        finny-chat-input-container
        ${keyboardHeight > 0 ? 'keyboard-active' : ''}
        ${isFocused ? 'input-focused' : ''}
      `}
      style={{
        '--keyboard-height': `${keyboardHeight}px`
      } as React.CSSProperties}
    >
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
            type="button"
            size="sm"
            onClick={handleCameraClick}
            disabled={!isAuthenticated || disabled || isLoading}
            className={`
              w-9 h-9 p-0 rounded-lg flex-shrink-0 mr-2
              ${isAuthenticated && !disabled && !isLoading
                ? 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }
            `}
          >
            <Camera className="w-4 h-4" />
          </Button>
          
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
