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
  return <div className="quick-reply-container py-[4px] px-[6px] my-[10px]">
      {replies.map((reply, index) => <button key={index} onClick={() => onSelect(reply)} disabled={isLoading || !isAuthenticated} className="quick-reply-button py-0 my-[0px] font-extralight">
          {reply.icon && <span className="mr-1.5">{reply.icon}</span>}
          {reply.text}
        </button>)}
    </div>;
};
export default QuickReplies;