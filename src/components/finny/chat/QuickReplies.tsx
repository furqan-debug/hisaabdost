
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
    <div className="flex flex-wrap gap-3 px-6 py-4 bg-gradient-to-r from-gray-50/50 via-white/50 to-gray-50/50 backdrop-blur-sm border-t border-gray-100">
      {replies.map((reply, index) => (
        <Button
          key={index}
          onClick={() => onSelect(reply)}
          disabled={isLoading || !isAuthenticated}
          variant="outline"
          size="sm"
          className="rounded-2xl text-sm shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 hover:text-blue-700 transform hover:scale-105 active:scale-95 font-medium"
        >
          <span className="text-blue-500">{reply.icon}</span>
          {reply.text}
        </Button>
      ))}
    </div>
  );
};

export default QuickReplies;
