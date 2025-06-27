
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotificationSettings } from './NotificationSettings';
import { useState } from 'react';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 hover:bg-muted/50 transition-colors py-px my-[15px]">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 border-0 shadow-none bg-transparent" align="end" sideOffset={8}>
        <NotificationSettings onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
