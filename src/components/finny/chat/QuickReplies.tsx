
import React from 'react';
import { QuickReply } from './types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const QuickReplies = ({
  replies,
  onSelect,
  isLoading,
  isAuthenticated
}: QuickRepliesProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-wrap gap-3 px-3 py-4">
      {replies.map((reply, index) => (
        <Button
          key={index}
          onClick={() => onSelect(reply)}
          disabled={isLoading || !isAuthenticated}
          variant="outline"
          size="sm"
          className="rounded-full text-sm shadow-sm hover:shadow-md transition-all hover:bg-accent/50 group"
        >
          {reply.icon && <span className="mr-2 group-hover:scale-110 transition-transform">{reply.icon}</span>}
          {reply.text}
        </Button>
      ))}
    </div>
  );
};

export default QuickReplies;
