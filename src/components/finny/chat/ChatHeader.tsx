
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
      className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 border-b border-blue-500/20 flex items-center justify-between px-6 py-4 relative overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-blue-400/10 backdrop-blur-3xl"></div>
      
      <div className="flex items-center space-x-4 relative z-10">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-md">
              <Bot size={18} className="text-white" />
            </div>
          </div>
          
          {/* Activity indicator */}
          <motion.div 
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white/50 shadow-sm"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-full h-full rounded-full bg-green-400 animate-pulse"></div>
          </motion.div>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xl text-white">Finny</h3>
            <Sparkles size={16} className="text-yellow-300" />
          </div>
          <p className="text-sm text-blue-100 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            AI Financial Assistant
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 relative z-10">
        {onMinimize && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMinimize}
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
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
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-red-500/30 rounded-xl transition-all duration-200 backdrop-blur-sm"
            title="Reset conversation"
          >
            <Trash2 size={18} />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
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
