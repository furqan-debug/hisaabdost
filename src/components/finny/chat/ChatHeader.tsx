
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
      className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 border-b border-blue-500/20 flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 relative overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-blue-400/10 backdrop-blur-3xl"></div>
      
      <div className="flex items-center space-x-2 sm:space-x-4 relative z-10 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 shadow-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-md">
              <Bot size={14} className="sm:w-[18px] sm:h-[18px] text-white" />
            </div>
          </div>
          
          {/* Activity indicator */}
          <motion.div 
            className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white/50 shadow-sm"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-full h-full rounded-full bg-green-400 animate-pulse"></div>
          </motion.div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <h3 className="font-bold text-lg sm:text-xl text-white truncate">Finny</h3>
            <Sparkles size={14} className="sm:w-4 sm:h-4 text-yellow-300 flex-shrink-0" />
          </div>
          <p className="text-xs sm:text-sm text-blue-100 flex items-center gap-1 sm:gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
            <span className="truncate">AI Financial Assistant</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2 relative z-10 flex-shrink-0">
        {onMinimize && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMinimize}
            className="h-8 w-8 sm:h-9 sm:w-9 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
            title="Minimize chat"
          >
            <Minimize2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          </Button>
        )}
        
        {onReset && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="h-8 w-8 sm:h-9 sm:w-9 text-white/80 hover:text-white hover:bg-red-500/30 rounded-xl transition-all duration-200 backdrop-blur-sm"
            title="Reset conversation"
          >
            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 sm:h-9 sm:w-9 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
          title="Close chat"
        >
          <X size={16} className="sm:w-[18px] sm:h-[18px]" />
        </Button>
      </div>
    </motion.div>
  );
});

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
