import React from 'react';
import { motion } from 'framer-motion';
import { Delete, CornerDownLeft } from 'lucide-react';

interface CustomKeyboardProps {
  isVisible: boolean;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onClose: () => void;
}

const CustomKeyboard: React.FC<CustomKeyboardProps> = ({
  isVisible,
  onKeyPress,
  onBackspace,
  onEnter,
  onClose
}) => {
  // Keyboard layout - optimized for financial chat queries
  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const numberRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const specialKeys = ['?', '!', '$', '@', '.', ',', '-'];

  const handleKeyPress = (key: string) => {
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onKeyPress(key);
  };

  const handleBackspace = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
    onBackspace();
  };

  const handleEnter = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
    onEnter();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-[60] bg-background border-t border-border"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom)',
        maxHeight: '320px'
      }}
    >
      <div className="p-3 space-y-2">
        {/* Numbers Row */}
        <div className="flex justify-center gap-1">
          {numberRow.map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              className="h-10 w-8 bg-muted hover:bg-muted/80 rounded text-sm font-medium transition-colors active:scale-95"
            >
              {key}
            </button>
          ))}
        </div>

        {/* Letter Rows */}
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="h-12 w-8 bg-muted hover:bg-muted/80 rounded text-sm font-medium transition-colors active:scale-95 uppercase"
              >
                {key}
              </button>
            ))}
          </div>
        ))}

        {/* Special Keys and Controls Row */}
        <div className="flex justify-between items-center gap-1">
          {/* Special characters */}
          <div className="flex gap-1">
            {specialKeys.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="h-10 w-8 bg-muted hover:bg-muted/80 rounded text-sm font-medium transition-colors active:scale-95"
              >
                {key}
              </button>
            ))}
          </div>

          {/* Space bar */}
          <button
            onClick={() => handleKeyPress(' ')}
            className="h-10 flex-1 mx-2 bg-muted hover:bg-muted/80 rounded text-sm font-medium transition-colors active:scale-95"
          >
            space
          </button>

          {/* Control buttons */}
          <div className="flex gap-1">
            <button
              onClick={handleBackspace}
              className="h-10 w-12 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded flex items-center justify-center transition-colors active:scale-95"
            >
              <Delete className="w-4 h-4" />
            </button>
            <button
              onClick={handleEnter}
              className="h-10 w-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded flex items-center justify-center transition-colors active:scale-95"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Close keyboard button */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => {
              console.log('Hide keyboard clicked');
              onClose();
            }}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95 cursor-pointer"
          >
            Hide Keyboard
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomKeyboard;