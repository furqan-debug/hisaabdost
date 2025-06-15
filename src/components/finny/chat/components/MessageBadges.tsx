
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
    <>
      {hasAction && (
        <span className="message-badge">
          Action
        </span>
      )}
      
      {isSuccess && (
        <span className="message-badge success-badge">
          Success
        </span>
      )}
      
      {isError && (
        <span className="message-badge error-badge">
          Error
        </span>
      )}
      
      {isEmpathetic && (
        <span className="message-badge empathy-badge">
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
    </>
  );
});

MessageBadges.displayName = 'MessageBadges';

export default MessageBadges;
