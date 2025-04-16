
import React from 'react';
import { QuickReply } from './types';
import { useIsMobile } from '@/hooks/use-mobile';

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const QuickReplies = ({ replies, onSelect, isLoading, isAuthenticated }: QuickRepliesProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="quick-reply-container">
      {replies.map((reply, index) => (
        <button 
          key={index} 
          className={`quick-reply-button ${isMobile ? 'py-2 px-4 text-sm touch-target' : ''}`}
          onClick={() => onSelect(reply)}
          disabled={isLoading || !isAuthenticated}
        >
          {reply.icon && <span className="mr-1.5">{reply.icon}</span>}
          {reply.text}
        </button>
      ))}
    </div>
  );
};

export default QuickReplies;
