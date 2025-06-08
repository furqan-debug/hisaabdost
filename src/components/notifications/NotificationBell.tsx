import { useState } from 'react';
import { Bell, BellDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotificationList } from './NotificationList';
import { useNotifications } from '@/hooks/useNotifications';
export function NotificationBell() {
  const {
    unreadCount
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  return <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 hover:bg-muted/50 transition-colors py-px my-[15px]">
          {unreadCount > 0 ? <BellDot className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {unreadCount > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center font-medium shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 border-0 shadow-none bg-transparent" align="end" sideOffset={8}>
        <NotificationList onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>;
}