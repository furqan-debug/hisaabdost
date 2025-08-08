import { useState, useCallback, useRef, useEffect } from 'react';

export const useCustomKeyboard = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show keyboard and position input above it
  const showKeyboard = useCallback(() => {
    setIsKeyboardVisible(true);
    // Prevent native keyboard from appearing
    if (inputRef.current) {
      inputRef.current.blur();
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 100);
    }
  }, []);

  // Hide keyboard
  const hideKeyboard = useCallback(() => {
    setIsKeyboardVisible(false);
  }, []);

  // Handle key press from custom keyboard
  const handleKeyPress = useCallback((key: string) => {
    setInputValue(prev => {
      const beforeCursor = prev.slice(0, cursorPosition);
      const afterCursor = prev.slice(cursorPosition);
      const newValue = beforeCursor + key + afterCursor;
      setCursorPosition(cursorPosition + key.length);
      return newValue;
    });
  }, [cursorPosition]);

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (cursorPosition === 0) return;
    
    setInputValue(prev => {
      const beforeCursor = prev.slice(0, cursorPosition - 1);
      const afterCursor = prev.slice(cursorPosition);
      setCursorPosition(cursorPosition - 1);
      return beforeCursor + afterCursor;
    });
  }, [cursorPosition]);

  // Handle enter key
  const handleEnter = useCallback(() => {
    return inputValue; // Return current value for submission
  }, [inputValue]);

  // Sync with external input changes
  const updateInputValue = useCallback((value: string) => {
    setInputValue(value);
    setCursorPosition(value.length);
  }, []);

  // Update cursor position when input value changes externally
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [cursorPosition, inputValue]);

  return {
    isKeyboardVisible,
    inputValue,
    inputRef,
    showKeyboard,
    hideKeyboard,
    handleKeyPress,
    handleBackspace,
    handleEnter,
    updateInputValue,
    cursorPosition,
    setCursorPosition
  };
};