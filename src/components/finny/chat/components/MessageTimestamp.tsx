
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface MessageTimestampProps {
  timestamp: Date;
  isUser?: boolean;
}

const MessageTimestamp = React.memo(({ timestamp, isUser }: MessageTimestampProps) => {
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  
  return (
    <div className={`text-xs ${isUser ? 'text-blue-200' : 'text-gray-400'} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
      {timeAgo}
    </div>
  );
});

MessageTimestamp.displayName = 'MessageTimestamp';

export default MessageTimestamp;
