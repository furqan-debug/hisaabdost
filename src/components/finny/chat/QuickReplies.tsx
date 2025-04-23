
import React from 'react';
import { QuickReply } from './types';
import { useIsMobile } from '@/hooks/use-mobile';

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
    <div className="flex flex-wrap gap-1.5 px-1.5 py-1.5">
      {replies.map((reply, index) => (
        <button
          key={index}
          onClick={() => onSelect(reply)}
          disabled={isLoading || !isAuthenticated}
          className="quick-reply-button inline-flex items-center text-xs py-1 px-2 rounded-md 
            bg-muted/80 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {reply.icon && <span className="mr-1">{reply.icon}</span>}
          {reply.text}
        </button>
      ))}
    </div>
  );
};

export default QuickReplies;
