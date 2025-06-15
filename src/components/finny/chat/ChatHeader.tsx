
import React from 'react';
import { X, Trash2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ChatHeaderProps {
  onClose: () => void;
  onReset?: () => void;
  onMinimize?: () => void;
}

const ChatHeader = React.memo(({
  onClose,
  onReset,
  onMinimize
}: ChatHeaderProps) => {
  return (
    <motion.div 
      className="bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4 py-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-lg text-white">Finny AI Assistant</h3>
          </div>
          <p className="text-sm text-gray-300 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Online • Ready to help with your finances
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        {onMinimize && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMinimize}
            className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200"
            title="Minimize chat"
          >
            <Minimize2 size={16} />
          </Button>
        )}
        
        {onReset && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="h-8 w-8 text-gray-300 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all duration-200"
            title="Reset conversation"
          >
            <Trash2 size={16} />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200"
          title="Close chat"
        >
          <X size={16} />
        </Button>
      </div>
    </motion.div>
  );
});

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
