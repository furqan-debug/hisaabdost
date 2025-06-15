
import React from 'react';
import { X, Trash2, Minimize2, Bot, Sparkles } from 'lucide-react';
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
      className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 flex items-center justify-between px-3 sm:px-4 py-3 relative overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-blue-900/10"></div>
      
      <div className="flex items-center space-x-3 sm:space-x-4 relative z-10 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center ring-1 ring-slate-600">
            <Bot size={20} className="text-white" />
          </div>
          <motion.div 
            className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-full h-full rounded-full bg-green-400 animate-pulse"></div>
          </motion.div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-lg text-slate-50 truncate">Finny</h3>
            <Sparkles size={16} className="text-yellow-400 flex-shrink-0" />
          </div>
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
            <span className="truncate">AI Financial Assistant</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1 relative z-10 flex-shrink-0">
        {onMinimize && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMinimize}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors"
            title="Minimize chat"
          >
            <Minimize2 size={18} />
          </Button>
        )}
        
        {onReset && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-red-500/30 rounded-full transition-colors"
            title="Reset conversation"
          >
            <Trash2 size={18} />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors"
          title="Close chat"
        >
          <X size={18} />
        </Button>
      </div>
    </motion.div>
  );
});

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
