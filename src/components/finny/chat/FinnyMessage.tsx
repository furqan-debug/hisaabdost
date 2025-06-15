
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/hooks/use-currency';
import MessageBadges from './components/MessageBadges';
import MessageTimestamp from './components/MessageTimestamp';
import ActionIndicator from './components/ActionIndicator';
import MessageAvatar from './components/MessageAvatar';

interface FinnyMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  hasAction?: boolean;
  visualData?: any;
}

const FinnyMessage = React.memo(({ 
  content, 
  isUser, 
  timestamp, 
  hasAction
}: FinnyMessageProps) => {
  const { currencyCode } = useCurrency();
  
  const formattedContent = useMemo(() => {
    let processedContent = content.replace(/\[ACTION:(.*?)\]/g, '');
    return processedContent;
  }, [content, currencyCode]);
  
  const isSuccess = formattedContent.includes('✅');
  const isError = formattedContent.includes('❌');

  const isEmpathetic = 
    !isUser &&
    (formattedContent.toLowerCase().includes("i understand") ||
     formattedContent.toLowerCase().includes("don't worry") ||
     formattedContent.toLowerCase().includes("sorry to hear") ||
     formattedContent.toLowerCase().includes("completely understand"));

  return (
    <motion.div
      className={`group flex items-start gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6 px-2 sm:px-0`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        delay: isUser ? 0 : 0.1
      }}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <MessageAvatar isUser={isUser} timestamp={timestamp} />
        </div>
      )}

      <div className={`
        max-w-[85%] sm:max-w-[80%] rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-2.5 sm:py-3 shadow-lg relative
        ${isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-blue-900/30' 
          : 'bg-white text-slate-800 shadow-black/20'
        }
        hover:shadow-xl transition-all duration-300
      `}>
        <div className={`
          absolute top-3 w-2.5 h-2.5 rotate-45
          ${isUser 
            ? 'bg-blue-700 -right-1' 
            : 'bg-white -left-1'
          }
        `} />

        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {formattedContent}
        </div>

        <ActionIndicator 
          hasAction={hasAction} 
          isSuccess={isSuccess} 
          isError={isError} 
        />
        
        <div className="flex justify-between items-end mt-2 sm:mt-3 pt-1 sm:pt-2 gap-2">
          <MessageBadges 
            content={formattedContent}
            isUser={isUser}
            isEmpathetic={isEmpathetic}
            isSuccess={isSuccess}
            isError={isError}
            hasAction={hasAction}
          />
          <MessageTimestamp timestamp={timestamp} isUser={isUser} />
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <MessageAvatar isUser={isUser} timestamp={timestamp} />
        </div>
      )}
    </motion.div>
  );
});

FinnyMessage.displayName = 'FinnyMessage';

export default FinnyMessage;
