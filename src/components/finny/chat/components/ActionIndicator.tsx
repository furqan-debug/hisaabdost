
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle } from 'lucide-react';

interface ActionIndicatorProps {
  hasAction?: boolean;
  isSuccess: boolean;
  isError: boolean;
}

const ActionIndicator = ({ hasAction, isSuccess, isError }: ActionIndicatorProps) => {
  if (!hasAction) return null;
  
  return (
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
  );
};

export default ActionIndicator;
