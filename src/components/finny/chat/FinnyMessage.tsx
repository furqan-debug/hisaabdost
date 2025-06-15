
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/hooks/use-currency';
import MessageBadges from './components/MessageBadges';
import MessageTimestamp from './components/MessageTimestamp';
import ActionIndicator from './components/ActionIndicator';

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
      className={`group flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        delay: isUser ? 0 : 0.1
      }}
    >
      <div className={`
        max-w-[85%] rounded-2xl px-4 py-3 shadow-lg
        ${isUser 
          ? 'bg-blue-600 text-white' 
          : isEmpathetic 
            ? 'bg-gray-800 text-gray-100 border border-gray-600' 
            : 'bg-gray-800 text-gray-100 border border-gray-600'
        }
      `}>
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {formattedContent}
        </div>

        {/* Action result indicators */}
        <ActionIndicator 
          hasAction={hasAction} 
          isSuccess={isSuccess} 
          isError={isError} 
        />
        
        <div className="flex justify-between items-end mt-2">
          <MessageBadges 
            content={formattedContent}
            isUser={isUser}
            isEmpathetic={isEmpathetic}
            isSuccess={isSuccess}
            isError={isError}
            hasAction={hasAction}
          />
          <MessageTimestamp timestamp={timestamp} />
        </div>
      </div>
    </motion.div>
  );
});

FinnyMessage.displayName = 'FinnyMessage';

export default FinnyMessage;
