
import React from 'react';

interface MessageBadgesProps {
  content: string;
  isUser: boolean;
  isEmpathetic: boolean;
  isSuccess: boolean;
  isError: boolean;
  hasAction?: boolean;
}

const MessageBadges = React.memo(({ 
  content, 
  isUser, 
  isEmpathetic, 
  isSuccess, 
  isError, 
  hasAction 
}: MessageBadgesProps) => {
  if (isUser) return null;

  return (
    <div className="flex gap-1 mt-1">
      {hasAction && (
        <span className="message-badge">
          Action
        </span>
      )}
      
      {isSuccess && (
        <span className="success-badge">
          Success
        </span>
      )}
      
      {isError && (
        <span className="error-badge">
          Error
        </span>
      )}
      
      {isEmpathetic && (
        <span className="empathy-badge">
          Support
        </span>
      )}
      
      {content.includes('budget') && (
        <span className="message-badge">
          Budget
        </span>
      )}
      
      {content.includes('expense') && (
        <span className="message-badge">
          Expense
        </span>
      )}
      
      {content.includes('goal') && (
        <span className="message-badge">
          Goal
        </span>
      )}
    </div>
  );
});

MessageBadges.displayName = 'MessageBadges';

export default MessageBadges;
