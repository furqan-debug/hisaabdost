
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface BroadcastNotificationPayload extends PushNotificationPayload {
  sendToAll: boolean;
}

export class PushNotificationService {
  private static isInitialized = false;

  static async initialize() {
    // Only initialize on native platforms and if not already initialized
    if (!Capacitor.isNativePlatform() || this.isInitialized) {
      console.log('Push notifications not available on web platform or already initialized');
      return;
    }

    try {
      // Request permission to use push notifications
      const permissionResult = await PushNotifications.requestPermissions();
      
      if (permissionResult.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
        
        // On success, we should be able to receive notifications
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          this.saveDeviceToken(token.value).catch(console.error);
        });

        // Some issue with our setup and push will not work
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
        });

        // Show us the notification payload if the app is open on our device
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received: ', notification);
        });

        // Method called when tapping on a notification
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed', notification.actionId, notification.inputValue);
        });

        this.isInitialized = true;
      } else {
        console.log('Push notification permission not granted');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      // Don't throw the error - let the app continue without push notifications
    }
  }

  private static async saveDeviceToken(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, skipping device token save');
        return;
      }

      const { error } = await supabase
        .from('user_device_tokens')
        .upsert({
          user_id: user.id,
          device_token: token,
          platform: Capacitor.getPlatform(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving device token:', error);
      } else {
        console.log('Device token saved successfully');
      }
    } catch (error) {
      console.error('Error in saveDeviceToken:', error);
    }
  }

  static async sendNotification(payload: PushNotificationPayload) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, cannot send notification');
        return;
      }

      // Call edge function to send push notification
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: user.id,
          ...payload
        }
      });

      if (error) {
        console.error('Error sending push notification:', error);
      }
    } catch (error) {
      console.error('Error in sendNotification:', error);
    }
  }

  static async sendBroadcastNotification(payload: BroadcastNotificationPayload) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, cannot send broadcast notification');
        return;
      }

      console.log('Sending broadcast notification to all users');

      // Call edge function to send push notification to all users
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          sendToAll: true,
          title: payload.title,
          body: payload.body,
          data: payload.data
        }
      });

      if (error) {
        console.error('Error sending broadcast notification:', error);
        throw error;
      }

      console.log('Broadcast notification sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in sendBroadcastNotification:', error);
      throw error;
    }
  }
}
