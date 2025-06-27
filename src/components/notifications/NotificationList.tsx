
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationListProps {
  onClose: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  return (
    <div className="w-full bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl">
      <div className="p-12 text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-muted/30 rounded-full mx-auto mb-4">
          <Settings className="w-6 h-6 text-muted-foreground" />
        </div>
        <h4 className="text-base font-medium text-foreground mb-2">Push Notifications Active</h4>
        <p className="text-sm text-muted-foreground mb-6">
          Notifications are now sent directly to your mobile device. Configure your notification preferences using the settings icon.
        </p>
        <Button onClick={onClose} variant="outline" size="sm">
          Close
        </Button>
      </div>
    </div>
  );
}
