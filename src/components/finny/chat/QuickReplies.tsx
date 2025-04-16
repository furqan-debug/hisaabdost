
import React from 'react';
import { IconComponent } from 'lucide-react';
import { QuickReply } from './types';

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const QuickReplies = ({ replies, onSelect, isLoading, isAuthenticated }: QuickRepliesProps) => {
  return (
    <div className="quick-reply-container">
      {replies.map((reply, index) => (
        <button 
          key={index} 
          className="quick-reply-button"
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
