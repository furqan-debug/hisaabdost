
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingFormData } from '../types';
import { Bell, Smartphone } from 'lucide-react';
import { isPlatform } from "@ionic/react";
import { usePushNotifications } from '@/hooks/use-push-notifications';

interface NotificationsStepProps {
  onComplete: (data: Partial<OnboardingFormData>) => void;
  initialData: OnboardingFormData;
}

export function NotificationsStep({ onComplete, initialData }: NotificationsStepProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(initialData.notificationsEnabled ?? true);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(initialData.pushNotificationsEnabled ?? true);
  const [notificationTime, setNotificationTime] = useState(initialData.notificationTime || '08:00');
  const isMobileApp = isPlatform('capacitor');
  const { registerNotifications } = usePushNotifications();

  const handleNext = async () => {
    // If push notifications are enabled and we're on a mobile app, register for them
    if (pushNotificationsEnabled && isMobileApp) {
      await registerNotifications();
    }
    
    onComplete({
      notificationsEnabled,
      pushNotificationsEnabled,
      notificationTime
    });
  };

  // Create array of time options from 00:00 to 23:30 in 30min intervals
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    const minute = (i % 2 === 0) ? '00' : '30';
    return `${hour}:${minute}`;
  });

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2 text-center mb-6">
        <Bell className="w-12 h-12 mx-auto text-primary mb-2" />
        <h1 className="text-2xl font-semibold tracking-tight">Daily Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Get daily summaries of your expenses and personalized financial tips
        </p>
      </div>

      {isMobileApp && (
        <div className="flex items-center justify-between py-4 border-b">
          <div>
            <Label htmlFor="push-notifications-enabled" className="font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Enable push notifications
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Get instant updates on your device
            </p>
          </div>
          <Switch
            id="push-notifications-enabled"
            checked={pushNotificationsEnabled}
            onCheckedChange={setPushNotificationsEnabled}
          />
        </div>
      )}

      <div className="flex items-center justify-between py-4">
        <div>
          <Label htmlFor="notifications-enabled" className="font-medium">
            Enable daily notifications
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Receive a summary of your expenses every day
          </p>
        </div>
        <Switch
          id="notifications-enabled"
          checked={notificationsEnabled}
          onCheckedChange={setNotificationsEnabled}
        />
      </div>

      {notificationsEnabled && (
        <div className="space-y-3 pt-2">
          <Label htmlFor="notification-time">When would you like to receive notifications?</Label>
          <Select value={notificationTime} onValueChange={setNotificationTime}>
            <SelectTrigger id="notification-time" className="w-full">
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map(time => (
                <SelectItem key={time} value={time}>{time}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Notifications will be sent at {notificationTime} in your local timezone.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={handleNext}>
          {(notificationsEnabled || (isMobileApp && pushNotificationsEnabled)) 
            ? 'Enable notifications' 
            : 'Continue without notifications'}
        </Button>
      </div>
    </div>
  );
}
