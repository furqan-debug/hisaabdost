
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { PieChart, BarChart3, Check, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FinnyMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  hasAction?: boolean;
  visualData?: any;
}

const FinnyMessage = ({ content, isUser, timestamp, hasAction, visualData }: FinnyMessageProps) => {
  // Remove any action markers from the message content for display
  const formattedContent = content.replace(/\[ACTION:(.*?)\]/g, '');
  
  // Check for links in the content
  const hasLinks = formattedContent.includes('http://') || formattedContent.includes('https://');
  
  // Format the timestamp
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  // Check for success/error indicators
  const isSuccess = formattedContent.includes('✅');
  const isError = formattedContent.includes('❌');

  return (
    <motion.div
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: isUser ? 0 : 0.1
      }}
    >
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
      
      <div className={`
        max-w-[85%] rounded-lg px-3.5 py-2.5 shadow-sm
        ${isUser 
          ? 'bg-green-500 text-white' 
          : 'bg-[#352F44] text-white'
        }
        ${hasLinks || hasAction || visualData ? 'space-y-2' : ''}
      `}>
        <div className="text-sm whitespace-pre-wrap break-words">
          {formattedContent}
        </div>
        
        {/* Visual Data - Renders charts or other visualizations */}
        {visualData && (
          <Card className="p-3 mt-2 bg-background/70 border border-muted">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
              {visualData.type === 'spending-chart' ? <PieChart size={14} /> : <BarChart3 size={14} />}
              <span>Finance Visualization</span>
            </div>
            <div className="w-full h-24 flex items-center justify-center bg-muted/30 rounded-md">
              {/* Placeholder for actual chart, will be implemented in future */}
              <span className="text-xs text-muted-foreground">
                (Visualization Preview)
              </span>
            </div>
          </Card>
        )}

        {/* Action result indicators */}
        {hasAction && (
          <div className="flex gap-1.5 items-center mt-1">
            <Badge variant="outline" className={`
              text-[10px] py-0 px-1.5 
              ${isSuccess 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                : isError 
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                  : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'}
            `}>
              <span className="flex items-center gap-1">
                {isSuccess && <Check size={10} />}
                {isError && <AlertCircle size={10} />}
                {isSuccess ? 'Action completed' : isError ? 'Action failed' : 'Action'}
              </span>
            </Badge>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-1">
          <div className="flex gap-1.5 flex-wrap">
            {!isUser && content.toLowerCase().includes('budget') && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary">
                budget
              </Badge>
            )}
            {!isUser && content.toLowerCase().includes('expense') && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary">
                expense
              </Badge>
            )}
            {!isUser && content.toLowerCase().includes('goal') && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                goal
              </Badge>
            )}
          </div>
          <div className="text-[10px] text-white/70 ml-auto">
            {formatTime(timestamp)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

export default FinnyMessage;
