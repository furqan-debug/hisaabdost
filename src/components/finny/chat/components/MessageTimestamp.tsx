
import React from 'react';
import { Clock } from 'lucide-react';

interface MessageTimestampProps {
  timestamp: Date;
}

const MessageTimestamp = ({ timestamp }: MessageTimestampProps) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  return (
    <div className="text-[10px] text-white/70 ml-auto flex items-center gap-1">
      <Clock size={10} />
      {formatTime(timestamp)}
    </div>
  );
};

export default MessageTimestamp;
