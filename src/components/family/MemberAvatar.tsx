import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFamilyContext } from '@/hooks/useFamilyContext';
import { useAuth } from '@/lib/auth';

interface MemberAvatarProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function MemberAvatar({ userId, size = 'sm', showTooltip = true }: MemberAvatarProps) {
  const { familyMembers } = useFamilyContext();
  const { user } = useAuth();
  
  const member = familyMembers.find(m => m.user_id === userId);
  const displayName = member?.profile?.display_name || member?.profile?.full_name || 'Unknown';
  const isCurrentUser = userId === user?.id;
  
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  const avatarElement = (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={member?.profile?.avatar_url || undefined} />
      <AvatarFallback className="bg-primary/10 text-primary">
        {displayName[0].toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  if (!showTooltip) {
    return avatarElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {avatarElement}
        </TooltipTrigger>
        <TooltipContent>
          <p>{isCurrentUser ? 'You' : displayName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
