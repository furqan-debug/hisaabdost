
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
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
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: isUser ? 0 : 0.2  // Delay bot messages slightly for a typing effect
      }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className={`w-8 h-8 ${isUser ? 'bg-primary/90' : 'bg-[#9b87f5]'}`}>
              <span className="text-xs font-semibold text-white">
                {isUser ? 'You' : 'F'}
              </span>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="top">
            {isUser ? 'You' : 'Finny'} • {timeAgo}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className={`
        max-w-[85%] rounded-2xl px-4 py-3 shadow-sm
        ${isUser 
          ? 'bg-primary text-primary-foreground rounded-tr-sm finny-message-user' 
          : 'bg-[#f8f5ff] dark:bg-[#2a2438] rounded-tl-sm finny-message-bot'
        }
        ${hasLinks || hasAction || visualData ? 'space-y-2' : ''}
      `}>
        <div className="text-sm whitespace-pre-wrap break-words">
          {formattedContent}
        </div>
        
        {/* Visual Data - Renders charts or other visualizations */}
        {visualData && (
          <Card className="p-3 mt-2 bg-background/70 dark:bg-background/30 border border-muted">
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
          <div className="flex gap-1.5">
            {!isUser && content.toLowerCase().includes('budget') && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                budget
              </Badge>
            )}
            {!isUser && content.toLowerCase().includes('expense') && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                expense
              </Badge>
            )}
            {!isUser && content.toLowerCase().includes('goal') && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                goal
              </Badge>
            )}
            {!isUser && (content.toLowerCase().includes('save') || content.toLowerCase().includes('saving')) && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                savings
              </Badge>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground ml-auto">
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
