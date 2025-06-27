
import { supabase } from '@/integrations/supabase/client';
import { NotificationService, NotificationTrigger } from './notificationService';

export class PushNotificationService {
  // Store push token for user
  static async storePushToken(userId: string, token: string, platform: 'ios' | 'android') {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: userId,
          token,
          platform,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing push token:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error storing push token:', error);
      return false;
    }
  }

  // Send push notification via edge function
  static async sendPushNotification(
    userId: string, 
    title: string, 
    body: string, 
    data?: Record<string, any>
  ) {
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId,
          title,
          body,
          data
        }
      });

      if (error) {
        console.error('Error sending push notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Create and send push notification from trigger
  static async createAndSendPushNotification(trigger: NotificationTrigger, userId: string) {
    if (!NotificationService.canSendNotification(trigger.type, trigger.category)) {
      return false;
    }

    const notification = NotificationService.createNotification(trigger);
    
    const success = await this.sendPushNotification(
      userId,
      notification.title,
      notification.description,
      {
        type: notification.type,
        category: notification.category
      }
    );

    if (success) {
      NotificationService.markNotificationSent(trigger.type, trigger.category);
    }

    return success;
  }
}
