
import React from 'react';
import { MessageSquareText, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatHeader = ({ onClose }: { onClose?: () => void }) => {
  const isMobile = useIsMobile();

  return (
    <div className="finny-chat-header flex justify-between items-center px-3 py-3 border-b bg-background/95 backdrop-blur-sm">
      <div className="finny-chat-title flex items-center gap-2">
        <MessageSquareText size={16} className="text-primary" />
        <span className="text-sm font-medium text-primary">Finny</span>
        <Badge className="finny-chat-badge text-[10px] py-0.5 px-2">AI Assistant</Badge>
      </div>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8" aria-label="Finny Help">
                <HelpCircle size={16} className="text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">Ask me about your finances! I can help with budgets, expenses, and saving tips 💡</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button 
          variant="ghost" 
          size="icon-sm"
          className="h-8 w-8" 
          onClick={onClose} 
          aria-label="Close Chat"
        >
          <X size={16} className="text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
