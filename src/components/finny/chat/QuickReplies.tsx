
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
    <div className="flex flex-wrap gap-2 px-1.5 py-3">
      {replies.map((reply, index) => (
        <Button
          key={index}
          onClick={() => onSelect(reply)}
          disabled={isLoading || !isAuthenticated}
          variant="outline"
          size="sm"
          className="rounded-full text-xs shadow-sm hover:shadow-md transition-all"
        >
          {reply.icon && <span className="mr-1.5">{reply.icon}</span>}
          {reply.text}
        </Button>
      ))}
    </div>
  );
};

export default QuickReplies;
