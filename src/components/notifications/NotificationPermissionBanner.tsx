import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const NotificationPermissionBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { requestPermission, isPermissionGranted } = usePushNotifications();

  useEffect(() => {
    const checkPermission = () => {
      const currentPermission = Notification.permission;
      setPermission(currentPermission);
      
      // Only show banner if permission is denied or default (not asked yet)
      const shouldShow = currentPermission !== 'granted' && 
                        !localStorage.getItem('notification-banner-dismissed');
      setIsVisible(shouldShow);
    };

    checkPermission();
  }, []);

  const handleRequestPermission = async () => {
    try {
      const newPermission = await requestPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  if (!isVisible || permission === 'granted') {
    return null;
  }

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {permission === 'denied' ? (
              <BellOff className="h-5 w-5 text-amber-600" />
            ) : (
              <Bell className="h-5 w-5 text-amber-600" />
            )}
            <CardTitle className="text-amber-900 dark:text-amber-100">
              Enable Smart Notifications
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-amber-600 hover:text-amber-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-amber-700 dark:text-amber-200">
          {permission === 'denied' 
            ? 'Notifications are blocked. Enable them in your browser settings to receive smart financial insights.'
            : 'Get personalized spending insights, budget alerts, and financial tips delivered as notifications.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {permission === 'denied' ? (
          <div className="text-sm text-amber-600 dark:text-amber-300">
            <p className="mb-2">To enable notifications:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Click the lock/info icon in your browser's address bar</li>
              <li>Change notifications from "Block" to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        ) : (
          <Button 
            onClick={handleRequestPermission}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Bell className="h-4 w-4 mr-2" />
            Enable Notifications
          </Button>
        )}
      </CardContent>
    </Card>
  );
};