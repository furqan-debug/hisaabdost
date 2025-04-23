
import React from 'react';
import { QuickReply } from './types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { PiggyBank, ChartPie, DollarSign, TrendingUp } from 'lucide-react';

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
    <div className="flex flex-wrap gap-3 px-3 py-4 bg-[#1A1F2C] border-t border-gray-800">
      {replies.map((reply, index) => (
        <Button
          key={index}
          onClick={() => onSelect(reply)}
          disabled={isLoading || !isAuthenticated}
          variant="outline"
          size="sm"
          className="rounded-full text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 bg-[#2D3748] border-gray-700 text-white hover:bg-[#374151]"
        >
          {reply.icon}
          {reply.text}
        </Button>
      ))}
    </div>
  );
};

export default QuickReplies;
