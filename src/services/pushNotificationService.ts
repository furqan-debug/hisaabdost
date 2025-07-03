
import { supabase } from '@/integrations/supabase/client';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface BroadcastNotificationPayload extends NotificationPayload {
  sendToAll?: boolean;
  userIds?: string[];
}

export class PushNotificationService {
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Push notifications already initialized');
      return;
    }

    try {
      // Check if we're in a web environment
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        console.log('Push notifications not available in this environment');
        return;
      }

      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.log('Service workers not supported');
        return;
      }

      // Check if push notifications are supported
      if (!('PushManager' in window)) {
        console.log('Push notifications not supported');
        return;
      }

      console.log('Push notifications initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      throw error;
    }
  }

  static async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      console.log('Sending push notification:', payload);
      
      // For web platform, we'll use the browser's Notification API
      if ('Notification' in window) {
        // Request permission if not already granted
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }

        if (Notification.permission === 'granted') {
          new Notification(payload.title, {
            body: payload.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
          });
        } else {
          console.log('Notification permission denied');
        }
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
      throw error;
    }
  }

  static async sendBroadcastNotification(payload: BroadcastNotificationPayload): Promise<any> {
    try {
      console.log('Sending broadcast notification via edge function:', payload);
      
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
          sendToAll: payload.sendToAll || false,
          userIds: payload.userIds || []
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Broadcast notification sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to send broadcast notification:', error);
      throw error;
    }
  }
}
