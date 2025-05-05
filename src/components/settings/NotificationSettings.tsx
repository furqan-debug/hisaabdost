
import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { isPlatform } from "@ionic/react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function NotificationSettings() {
  const { user } = useAuth();
  const { registerNotifications, pushToken } = usePushNotifications();
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(!!pushToken);
  const [notificationTime, setNotificationTime] = useState("08:00");
  const [timezone, setTimezone] = useState("");
  const isMobileApp = isPlatform('capacitor');
  
  useEffect(() => {
    // Get user's current timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(userTimezone);
    
    // Load user's notification settings
    const loadSettings = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('notifications_enabled, notification_time, notification_timezone')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error loading notification settings:", error);
          return;
        }
        
        if (data) {
          setNotificationsEnabled(data.notifications_enabled || false);
          
          // Format time from HH:MM:SS to HH:MM
          if (data.notification_time) {
            const timeparts = data.notification_time.split(':');
            setNotificationTime(`${timeparts[0]}:${timeparts[1]}`);
          }
          
          if (data.notification_timezone) {
            setTimezone(data.notification_timezone);
          }
        }
      } catch (error) {
        console.error("Error loading notification settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [user]);
  
  const handleToggleNotifications = async (enabled: boolean) => {
    if (!user?.id) return;
    
    setNotificationsEnabled(enabled);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          notifications_enabled: enabled,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success(
        enabled 
          ? "Daily notifications enabled" 
          : "Daily notifications disabled"
      );
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast.error("Failed to update notification settings");
      setNotificationsEnabled(!enabled); // Revert UI state
    }
  };
  
  const handleTogglePushNotifications = async (enabled: boolean) => {
    setPushNotificationsEnabled(enabled);
    
    if (enabled) {
      await registerNotifications();
      toast.success("Push notifications enabled");
    } else {
      toast.info("Please disable notifications from your device settings");
    }
  };
  
  const handleTimeChange = async (time: string) => {
    if (!user?.id) return;
    
    setNotificationTime(time);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          notification_time: `${time}:00`, // Add seconds for database
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success("Notification time updated");
    } catch (error) {
      console.error("Error updating notification time:", error);
      toast.error("Failed to update notification time");
    }
  };

  // Create array of time options from 00:00 to 23:30 in 30min intervals
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    const minute = (i % 2 === 0) ? '00' : '30';
    return `${hour}:${minute}`;
  });
  
  if (loading) {
    return <div className="px-4 py-3 flex items-center text-muted-foreground">Loading...</div>;
  }
  
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Notifications</h3>
      </div>
      
      {isMobileApp && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <Label htmlFor="push-notifications" className="font-normal flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Push notifications
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Receive notifications on your device
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotificationsEnabled}
              onCheckedChange={handleTogglePushNotifications}
            />
          </div>
          <Separator className="my-4" />
        </>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <Label htmlFor="daily-notifications" className="font-normal">
            Daily expense summary
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Get a daily summary of yesterday's expenses and financial tips
          </p>
        </div>
        <Switch
          id="daily-notifications"
          checked={notificationsEnabled}
          onCheckedChange={handleToggleNotifications}
        />
      </div>
      
      {notificationsEnabled && (
        <div className="mt-4 mb-3 space-y-2">
          <Label htmlFor="notification-time" className="text-xs text-muted-foreground">
            Notification time
          </Label>
          <Select value={notificationTime} onValueChange={handleTimeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Timezone: {timezone}
          </p>
        </div>
      )}
      
      <Separator className="my-4" />
    </div>
  );
}
