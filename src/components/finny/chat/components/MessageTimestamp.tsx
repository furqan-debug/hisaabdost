
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface MessageTimestampProps {
  timestamp: Date;
}

const MessageTimestamp = React.memo(({ timestamp }: MessageTimestampProps) => {
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  
  return (
    <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {timeAgo}
    </div>
  );
});

MessageTimestamp.displayName = 'MessageTimestamp';

export default MessageTimestamp;
