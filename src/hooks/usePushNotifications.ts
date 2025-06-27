
import { useEffect } from 'react';
import { PushNotificationService } from '@/services/pushNotificationService';
import { useAuth } from '@/lib/auth';

export function usePushNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      PushNotificationService.initialize();
    }
  }, [user]);

  const sendNotification = async (title: string, body: string, data?: Record<string, any>) => {
    await PushNotificationService.sendNotification({ title, body, data });
  };

  return { sendNotification };
}
