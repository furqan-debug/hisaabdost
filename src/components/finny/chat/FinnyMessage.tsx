
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
  visualData?: any; // Keeping this prop to avoid breaking existing code, but we won't use it
}

const FinnyMessage = React.memo(({ 
  content, 
  isUser, 
  timestamp, 
  hasAction
}: FinnyMessageProps) => {
  // Remove any action markers from the message content for display
  const formattedContent = content.replace(/\[ACTION:(.*?)\]/g, '');
  
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
      <MessageAvatar isUser={isUser} timestamp={timestamp} />
      
      <div className={`
        max-w-[85%] rounded-lg px-3.5 py-2.5 shadow-sm
        ${isUser 
          ? 'bg-green-500 text-white' 
          : isEmpathetic 
            ? 'bg-[#3e3559] text-white' // More empathetic tone for supportive messages
            : 'bg-[#352F44] text-white'
        }
      `}>
        <div className="text-sm whitespace-pre-wrap break-words">
          {formattedContent}
        </div>

        {/* Action result indicators */}
        <ActionIndicator 
          hasAction={hasAction} 
          isSuccess={isSuccess} 
          isError={isError} 
        />
        
        <div className="flex justify-between items-center mt-1">
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
