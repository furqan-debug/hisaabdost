import React from 'react';
import { MessageSquareText, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
const ChatHeader = () => {
  return <div className="finny-chat-header my--11 mx--5  py-[11px]">
      <div className="finny-chat-title">
        <MessageSquareText size={18} className="text-primary" />
        <span className="text-primary font-medium">Finny</span>
        <Badge className="finny-chat-badge ml-1">Finance Assistant</Badge>
      </div>
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
    </div>;
};
export default ChatHeader;