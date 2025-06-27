
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Smartphone, Check, X } from 'lucide-react';
import { useMobilePushNotifications } from '@/hooks/useMobilePushNotifications';
import { Capacitor } from '@capacitor/core';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function PushNotificationSetup() {
  const { isSupported, token } = useMobilePushNotifications();
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    setIsSetup(!!token);
  }, [token]);

  if (!Capacitor.isNativePlatform()) {
    return (
      <Alert>
        <Smartphone className="h-4 w-4" />
        <AlertDescription>
          Push notifications are only available on mobile devices. Install the mobile app to receive notifications.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Mobile Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Notification Status</p>
            <p className="text-sm text-muted-foreground">
              Receive budget alerts and reminders directly on your phone
            </p>
          </div>
          <Badge variant={isSetup ? "default" : "secondary"} className="flex items-center gap-1">
            {isSetup ? (
              <>
                <Check className="h-3 w-3" />
                Active
              </>
            ) : (
              <>
                <X className="h-3 w-3" />
                Inactive
              </>
            )}
          </Badge>
        </div>

        {isSupported && !isSetup && (
          <Alert>
            <AlertDescription>
              Push notifications are supported but not yet configured. They will be automatically set up when you grant permission.
            </AlertDescription>
          </Alert>
        )}

        {isSetup && (
          <Alert>
            <AlertDescription className="text-green-700 dark:text-green-400">
              ✅ Push notifications are active! You'll receive important budget alerts and financial reminders directly on your phone.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <p>You'll receive notifications for:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Budget warnings (when you reach 95% of budget)</li>
            <li>Budget exceeded alerts (when spending exceeds budget significantly)</li>
            <li>Low wallet balance warnings</li>
            <li>Monthly financial summaries</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
