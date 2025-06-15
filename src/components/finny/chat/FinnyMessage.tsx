
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCurrency } from '@/hooks/use-currency';
import MessageAvatar from './components/MessageAvatar';
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
      className={`group flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        delay: isUser ? 0 : 0.1
      }}
    >
      <MessageAvatar isUser={isUser} timestamp={timestamp} />
      
      <div className={`
        max-w-[80%] rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm
        ${isUser 
          ? 'finny-message-user bg-gradient-to-br from-green-500 to-green-600 text-white' 
          : isEmpathetic 
            ? 'finny-message-bot bg-gradient-to-br from-purple-600/90 to-purple-700/90 text-white border border-purple-500/30' 
            : 'finny-message-bot bg-gradient-to-br from-[#2D3748]/90 to-[#4A5568]/90 text-white border border-gray-600/30'
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
