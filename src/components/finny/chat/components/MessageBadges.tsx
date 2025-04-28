
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle } from 'lucide-react';

interface MessageBadgesProps {
  content: string;
  isUser: boolean;
  isEmpathetic: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  hasAction?: boolean;
}

const MessageBadges = ({ 
  content, 
  isUser, 
  isEmpathetic, 
  isSuccess, 
  isError, 
  hasAction 
}: MessageBadgesProps) => {
  if (isUser) return null;
  
  return (
    <div className="flex gap-1.5 flex-wrap">
      {hasAction && (
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
      )}
      
      {content.toLowerCase().includes('budget') && (
        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary">
          budget
        </Badge>
      )}
      {content.toLowerCase().includes('expense') && (
        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary">
          expense
        </Badge>
      )}
      {content.toLowerCase().includes('goal') && (
        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
          goal
        </Badge>
      )}
      {isEmpathetic && (
        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
          support
        </Badge>
      )}
    </div>
  );
};

export default MessageBadges;
