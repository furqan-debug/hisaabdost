
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserSectionProps {
  onSignOut: () => void;
}

export function UserSection({
  onSignOut
}: UserSectionProps) {
  const {
    user
  } = useAuth();
  
  return (
    <div className="bg-background border-t p-4 py-[11px]">
      <div className="flex items-center mb-4">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage 
            src="https://images.unsplash.com/photo-1501286353178-1ec881214838?w=100&h=100&fit=crop&crop=face" 
            alt={user?.email || "User"} 
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            🐵
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user?.email}</p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email?.split("@")[0]}
          </p>
        </div>
      </div>
      
      <Button variant="destructive" className="w-full justify-start" onClick={onSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
