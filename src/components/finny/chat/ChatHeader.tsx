
import React from 'react';
import { MessageSquareText, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatHeader = ({
  onClose
}: {
  onClose?: () => void;
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="finny-chat-header flex justify-between items-center border-b bg-background/95 backdrop-blur-sm py-[13px] my-0 px-[18px] mx-[2px]">
      <div className="finny-chat-title flex items-center gap-2">
        <MessageSquareText size={16} className="text-primary" />
        <span className="text-sm font-medium text-primary">Finny</span>
        <Badge variant="secondary" className="finny-chat-badge text-[10px] py-0.5 px-2">Finance Assistant</Badge>
      </div>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8 hover:bg-accent/50" aria-label="Finny Help">
                <HelpCircle size={15} className="text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[200px]">
              <p className="text-xs">Hi! I'm Finny, your AI finance assistant. I can help you track expenses, set budgets, and give you money-saving tips! 💡</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button 
          variant="ghost" 
          size="icon-sm" 
          className="h-8 w-8 hover:bg-accent/50" 
          onClick={onClose} 
          aria-label="Close Chat"
        >
          <X size={15} className="text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
