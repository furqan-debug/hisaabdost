import { FamilyMember } from '@/types/family';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Shield, User, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MemberCardProps {
  member: FamilyMember;
  canRemove: boolean;
  onRemove: () => void;
  isCurrentUser: boolean;
}

export function MemberCard({ member, canRemove, onRemove, isCurrentUser }: MemberCardProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3.5 w-3.5" />;
      case 'admin':
        return <Shield className="h-3.5 w-3.5" />;
      default:
        return <User className="h-3.5 w-3.5" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30';
      case 'admin':
        return 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const displayName = member.profile?.display_name || member.profile?.full_name || 'Unknown User';
  const initials = displayName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-border group-hover:ring-primary/50 transition-all">
              <AvatarImage src={member.profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Member Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">
                {displayName}
                {isCurrentUser && (
                  <span className="text-xs text-muted-foreground ml-2">(You)</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">
                Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Role Badge & Actions */}
          <div className="flex items-center gap-2">
            <Badge className={`gap-1 ${getRoleBadgeClass(member.role)}`}>
              {getRoleIcon(member.role)}
              {member.role}
            </Badge>
            {canRemove && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onRemove}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
