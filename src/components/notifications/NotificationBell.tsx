import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotificationSettings } from './NotificationSettings';
import { useState } from 'react';
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  return <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 border-0 shadow-none bg-transparent" align="end" sideOffset={8}>
        <NotificationSettings onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>;
}