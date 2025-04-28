
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatHistoryBannerProps {
  oldestMessageTime?: Date;
}

export const ChatHistoryBanner = ({ oldestMessageTime }: ChatHistoryBannerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  useEffect(() => {
    if (!oldestMessageTime) return;
    
    const updateTimeLeft = () => {
      const expiresAt = new Date(oldestMessageTime.getTime() + 24 * 60 * 60 * 1000);
      setTimeLeft(formatDistanceToNow(expiresAt));
    };
    
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [oldestMessageTime]);
  
  if (!oldestMessageTime) return null;
  
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-800/40 p-3 mb-4">
      <Info className="h-4 w-4 text-gray-400 flex-shrink-0" />
      <p className="text-xs text-gray-300">
        Chat history is saved for 24 hours. Older messages will be automatically removed in {timeLeft}.
      </p>
    </div>
  );
};
