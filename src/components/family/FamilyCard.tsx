import { Family } from '@/types/family';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MoreVertical, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FamilyCardProps {
  family: Family;
  isActive: boolean;
  memberCount: number;
  onSwitch: () => void;
  onSettings?: () => void;
  onLeave?: () => void;
}

export function FamilyCard({ 
  family, 
  isActive, 
  memberCount,
  onSwitch,
  onSettings,
  onLeave
}: FamilyCardProps) {
  const initials = family.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        isActive ? 'ring-2 ring-primary shadow-md' : ''
      }`}
      onClick={onSwitch}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Family Avatar */}
          <div className={`relative ${isActive ? 'animate-pulse-subtle' : ''}`}>
            <Avatar className="h-14 w-14 ring-2 ring-border">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isActive && (
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full ring-2 ring-background animate-pulse" />
            )}
          </div>

          {/* Family Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{family.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Created {new Date(family.created_at).toLocaleDateString()}
                </p>
              </div>
              
              {/* Action Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onSettings && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSettings(); }}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                  )}
                  {onLeave && (
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onLeave(); }}
                      className="text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave Family
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Stats & Badges */}
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </Badge>
              {isActive && (
                <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                  ● Active
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
