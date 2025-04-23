
import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatHeaderProps {
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose
}) => {
  return <div className="finny-chat-header py-3 flex items-center justify-between bg-[#1A1F2C] border-b border-gray-800/50 mx--2 px-[19px]">
      <div className="flex items-center gap-2.5">
        <div className="text-lg font-medium text-white flex items-center">
          <span className="text-yellow-400 mr-2">💰</span>
          Finny
        </div>
        <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          AI Assistant
        </Badge>
      </div>
      <div className="flex items-center gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-gray-400 hover:text-white rounded-full p-2 hover:bg-white/5 transition-colors" aria-label="Help">
                <HelpCircle size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="text-xs max-w-[220px] p-2">
              <p>Ask Finny about your expenses, budgets, or category-specific insights like "Show my transportation spending"</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <button onClick={onClose} className="text-gray-400 hover:text-white rounded-full p-2 hover:bg-white/5 transition-colors" aria-label="Close chat">
          <X size={16} />
        </button>
      </div>
    </div>;
};

export default ChatHeader;
