
import React from 'react';
import { MessageSquareText, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatHeader = ({ onClose }: { onClose?: () => void }) => {
  const isMobile = useIsMobile();

  return (
    <div className="finny-chat-header flex justify-between items-center my--11 mx--5 my--0 mx-[-9px] py-[18px] px-[17px]">
      <div className="finny-chat-title flex items-center gap-2">
        <MessageSquareText size={18} className="text-primary" />
        <span className="text-primary font-medium">Finny</span>
        <Badge className="finny-chat-badge ml-1">Finance Assistant</Badge>
      </div>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="rounded-lg hover:bg-muted/80" aria-label="Finny Help">
                <HelpCircle size={16} className="text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">Ask Finny about your finances, budgets, and money tips!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Always show the close button, not just on mobile */}
        <Button 
          variant="ghost" 
          size="icon-sm" 
          className="rounded-lg hover:bg-muted/80" 
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
