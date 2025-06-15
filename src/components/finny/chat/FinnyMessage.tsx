
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
  
  // Remove any action markers from the message content for display
  const formattedContent = useMemo(() => {
    let processedContent = content.replace(/\[ACTION:(.*?)\]/g, '');
    return processedContent;
  }, [content, currencyCode]);
  
  // Check for success/error indicators
  const isSuccess = formattedContent.includes('✅');
  const isError = formattedContent.includes('❌');

  // Detect emotional tone in message to apply appropriate styling
  const isEmpathetic = 
    !isUser &&
    (formattedContent.toLowerCase().includes("i understand") ||
     formattedContent.toLowerCase().includes("don't worry") ||
     formattedContent.toLowerCase().includes("sorry to hear") ||
     formattedContent.toLowerCase().includes("completely understand"));

  return (
    <motion.div
      className={`group flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        delay: isUser ? 0 : 0.1
      }}
    >
      {/* Avatar for bot messages (left side) */}
      {!isUser && (
        <MessageAvatar isUser={isUser} timestamp={timestamp} />
      )}

      <div className={`
        max-w-[80%] rounded-3xl px-5 py-4 shadow-lg relative backdrop-blur-sm
        ${isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/25' 
          : isEmpathetic 
            ? 'bg-gradient-to-br from-purple-50 to-pink-50 text-gray-800 border border-purple-100 shadow-purple-100/50' 
            : 'bg-white text-gray-800 border border-gray-100 shadow-gray-200/50'
        }
        hover:shadow-xl transition-all duration-300
      `}>
        {/* Message bubble tail */}
        <div className={`
          absolute top-4 w-3 h-3 rotate-45
          ${isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 -right-1.5' 
            : isEmpathetic
              ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-l border-t border-purple-100 -left-1.5'
              : 'bg-white border-l border-t border-gray-100 -left-1.5'
          }
        `} />

        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
          {formattedContent}
        </div>

        {/* Action result indicators */}
        <ActionIndicator 
          hasAction={hasAction} 
          isSuccess={isSuccess} 
          isError={isError} 
        />
        
        <div className="flex justify-between items-end mt-3 pt-2">
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

      {/* Avatar for user messages (right side) */}
      {isUser && (
        <MessageAvatar isUser={isUser} timestamp={timestamp} />
      )}
    </motion.div>
  );
});

FinnyMessage.displayName = 'FinnyMessage';

export default FinnyMessage;
