
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
    <Alert variant="default" className="mb-4 bg-muted/50 border-primary/20">
      <Info className="h-4 w-4 text-primary" />
      <AlertDescription className="text-sm">
        Chat history is saved for 24 hours. Older messages will be automatically removed in {timeLeft}.
      </AlertDescription>
    </Alert>
  );
};
