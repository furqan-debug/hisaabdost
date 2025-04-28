
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

interface MessageAvatarProps {
  isUser: boolean;
  timestamp: Date;
}

const MessageAvatar = ({ isUser, timestamp }: MessageAvatarProps) => {
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar>
            <AvatarImage 
              src={
                isUser 
                  ? "/lovable-uploads/636d3f3b-f98d-4539-a003-5afe36b96701.png" 
                  : "/lovable-uploads/37d37218-6a8c-434e-b03d-977ee786a0b1.png"
              } 
              alt={isUser ? "User" : "Finny"}
            />
            <AvatarFallback>
              {isUser ? 'You' : 'F'}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent side="top">
          {isUser ? 'You' : 'Finny'} • {timeAgo}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MessageAvatar;
