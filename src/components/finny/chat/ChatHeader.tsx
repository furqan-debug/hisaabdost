
import React from 'react';
import { X, Trash2, Minimize2, Bot } from 'lucide-react';
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
      className="bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-300 to-green-400 flex items-center justify-center ring-2 ring-white">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-base text-gray-800">Finny AI Assistant</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Online
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        {onMinimize && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMinimize}
            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
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
            className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-100/50 rounded-lg transition-all duration-200"
            title="Reset conversation"
          >
            <Trash2 size={16} />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
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
