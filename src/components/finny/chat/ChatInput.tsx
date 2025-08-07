
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Plus, Camera, Image, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFileAttachment, AttachedFile } from '@/hooks/useFileAttachment';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent, attachedFile?: AttachedFile) => void;
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
  
  const {
    attachedFile,
    showAttachmentOptions,
    fileInputRef,
    handleFileSelect,
    handleCameraCapture,
    removeAttachment,
    toggleAttachmentOptions,
  } = useFileAttachment();

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
    if ((!value.trim() && !attachedFile) || disabled || isLoading || !isAuthenticated) return;
    onSubmit(e, attachedFile || undefined);
    if (attachedFile) {
      removeAttachment();
    }
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

  const canSend = (value.trim() || attachedFile) && !disabled && !isLoading && isAuthenticated;

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
      <div className="w-full space-y-2">
        {/* Image Preview */}
        <AnimatePresence>
          {attachedFile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative inline-block"
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-primary/20 bg-muted">
                <img
                  src={attachedFile.preview}
                  alt="Attached image"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeAttachment}
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className={`
            flex items-center gap-2 p-3 rounded-xl border transition-all duration-200
            ${isFocused 
              ? 'border-primary bg-background shadow-lg' 
              : 'border-border bg-muted/50'
            }
          `}>
            {/* Attachment Button */}
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleAttachmentOptions}
                disabled={disabled || !isAuthenticated}
                className={`
                  w-9 h-9 p-0 rounded-lg flex-shrink-0 transition-all duration-200
                  ${showAttachmentOptions 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted-foreground/10'
                  }
                `}
              >
                <Plus className={`w-4 h-4 transition-transform duration-200 ${showAttachmentOptions ? 'rotate-45' : ''}`} />
              </Button>

              {/* Attachment Options */}
              <AnimatePresence>
                {showAttachmentOptions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed bottom-24 left-4 right-4 sm:absolute sm:bottom-full sm:left-0 sm:right-auto sm:mb-2 sm:w-auto flex gap-2 p-3 bg-background/95 backdrop-blur-sm border rounded-xl shadow-xl z-[10000]"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-12 h-12 p-0 rounded-xl hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all duration-200 border border-border/50"
                      title="Choose from gallery"
                    >
                      <Image className="w-5 h-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCameraCapture}
                      className="w-12 h-12 p-0 rounded-xl hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all duration-200 border border-border/50"
                      title="Take photo"
                    >
                      <Camera className="w-5 h-5" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Text Input */}
            <Input
              ref={inputRef}
              value={value}
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled || !isAuthenticated}
              placeholder={attachedFile ? "Add a message about your image..." : placeholder}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
            />
            
            {/* Send Button */}
            <Button
              type="submit"
              size="sm"
              disabled={!canSend}
              className={`
                w-9 h-9 p-0 rounded-lg flex-shrink-0 transition-all duration-200
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
        </form>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatInput;
