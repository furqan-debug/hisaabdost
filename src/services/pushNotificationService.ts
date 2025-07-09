
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
  private static permissionRequested = false;

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

      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.log('Notifications not supported in this browser');
        return;
      }

      // Request permission if not already requested
      if (!this.permissionRequested) {
        await this.requestPermission();
      }

      console.log('Push notifications initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      throw error;
    }
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return 'denied';
    }

    this.permissionRequested = true;

    if (Notification.permission === 'default') {
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Notification permission result:', permission);
      return permission;
    }

    return Notification.permission;
  }

  static async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      console.log('Sending push notification:', payload);
      
      // Ensure we have permission
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        console.log('Notification permission not granted:', permission);
        return;
      }

      // Send browser notification
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'hisaab-dost-notification',
        requireInteraction: false,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      console.log('Browser notification sent successfully');
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

  static getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  static isPermissionGranted(): boolean {
    return this.getPermissionStatus() === 'granted';
  }
}
