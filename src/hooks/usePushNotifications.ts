
import { useEffect } from 'react';
import { PushNotificationService } from '@/services/pushNotificationService';
import { useAuth } from '@/lib/auth';

export function usePushNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Initialize push notifications when user is available
      PushNotificationService.initialize().catch(error => {
        console.log('Push notification initialization failed:', error);
      });
    }
  }, [user]);

  const sendNotification = async (title: string, body: string, data?: Record<string, any>) => {
    try {
      await PushNotificationService.sendNotification({ title, body, data });
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  };

  const sendBroadcastNotification = async (title: string, body: string, data?: Record<string, any>) => {
    try {
      const result = await PushNotificationService.sendBroadcastNotification({ 
        title, 
        body, 
        data,
        sendToAll: true 
      });
      return result;
    } catch (error) {
      console.error('Failed to send broadcast notification:', error);
      throw error;
    }
  };

  return { 
    sendNotification, 
    sendBroadcastNotification 
  };
}
