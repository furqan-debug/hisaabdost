
import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChatHeaderProps {
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
  return (
    <div className="finny-chat-header p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="text-lg font-semibold text-white flex items-center">
          <span className="text-green-400 mr-2">💰</span>
          Finny
        </div>
        <Badge variant="outline" className="finny-chat-badge px-2 py-0.5 text-[10px] bg-[#9b87f5]/20 text-[#9b87f5]">
          AI Assistant
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-gray-400 hover:text-white rounded-full p-1.5 hover:bg-gray-800/30 transition-colors" aria-label="Help">
          <HelpCircle size={18} />
        </button>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-white rounded-full p-1.5 hover:bg-gray-800/30 transition-colors"
          aria-label="Close chat"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
