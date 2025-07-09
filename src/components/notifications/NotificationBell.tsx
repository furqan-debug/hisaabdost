
import { Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotificationSettings } from './NotificationSettings';
import { useState, useEffect } from 'react';
import { PushNotificationService } from '@/services/pushNotificationService';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Check permission status on mount
    const checkPermission = () => {
      setHasPermission(PushNotificationService.isPermissionGranted());
    };

    checkPermission();
    
    // Check permission status every few seconds
    const interval = setInterval(checkPermission, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className={`h-5 w-5 ${hasPermission ? 'text-green-600' : 'text-muted-foreground'}`} />
          {!hasPermission && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 border-0 shadow-none bg-transparent" align="end" sideOffset={8}>
        <NotificationSettings onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
