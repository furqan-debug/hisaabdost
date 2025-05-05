
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { isPlatform } from "@ionic/react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface UserSectionProps {
  onSignOut: () => void;
}

export function UserSection({
  onSignOut
}: UserSectionProps) {
  const {
    user
  } = useAuth();
  const { registerNotifications, pushToken } = usePushNotifications();
  const [notificationsEnabled, setNotificationsEnabled] = useState(!!pushToken);
  const isMobileApp = isPlatform('capacitor');

  const handleNotificationsToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    
    if (enabled) {
      await registerNotifications();
      toast.success("Notifications enabled");
    } else {
      toast.info("Please disable notifications from your device settings");
    }
  };
  
  return <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 flex-shrink-0 z-10 py-[11px]">
      <div className="flex items-center mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user?.email}</p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email?.split("@")[0]}
          </p>
        </div>
      </div>
      
      {isMobileApp && (
        <div className="flex items-center justify-between mb-3 pb-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">Push Notifications</p>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={handleNotificationsToggle}
          />
        </div>
      )}
      
      <Button variant="destructive" className="w-full justify-start" onClick={onSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>;
}
