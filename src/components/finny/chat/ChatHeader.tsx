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
  return <div className="finny-chat-header flex justify-between items-center border-b bg-background/95 backdrop-blur-sm py-[13px] my-0 px-[18px] mx-[2px]">
      <div className="finny-chat-title flex items-center gap-1.5">
        <MessageSquareText size={14} className="text-primary" />
        <span className="text-sm font-medium text-primary">Finny</span>
        <Badge className="finny-chat-badge text-[10px] py-0 px-1.5">Finance Assistant</Badge>
      </div>
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-7 w-7" aria-label="Finny Help">
                <HelpCircle size={14} className="text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">Ask Finny about your finances, budgets, and money tips!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={onClose} aria-label="Close Chat">
          <X size={14} className="text-muted-foreground" />
        </Button>
      </div>
    </div>;
};
export default ChatHeader;