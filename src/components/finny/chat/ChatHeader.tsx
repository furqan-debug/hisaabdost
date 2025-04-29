
import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChatHeaderProps {
  onClose: () => void;
  onReset?: () => void;
}

const ChatHeader = ({ onClose, onReset }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 finny-chat-header">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
            <span className="font-medium text-sm">F</span>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-base">Finny</h3>
            <Badge variant="outline" className="finny-chat-badge text-xs px-1.5">AI</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Financial Assistant</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {onReset && (
          <button
            onClick={onReset}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            title="Reset conversation"
          >
            <Trash2 size={18} />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-1.5 text-muted-foreground hover:text-accent-foreground hover:bg-accent/50 rounded-md transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
