
import React from 'react';
import { MessageCircleHeart, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ChatHeader = () => {
  return (
    <div className="finny-chat-header">
      <div className="finny-chat-title">
        <MessageCircleHeart size={20} className="text-[#9b87f5]" />
        <span className="text-[#9b87f5] font-semibold">Finny</span>
        <Badge className="finny-chat-badge ml-1">Finance Assistant</Badge>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              className="rounded-full hover:bg-muted/80"
              aria-label="Finny Help"
            >
              <HelpCircle size={16} className="text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">Ask Finny about your finances, budgets, and money tips!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ChatHeader;
