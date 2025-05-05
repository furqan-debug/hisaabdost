import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
interface UserSectionProps {
  onSignOut: () => void;
}
export function UserSection({
  onSignOut
}: UserSectionProps) {
  const {
    user
  } = useAuth();
  return <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 flex-shrink-0 z-10 py-[11px]">
      <div className="flex items-center mb-4">
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
    </div>;
}