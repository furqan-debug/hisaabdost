
import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { isPlatform } from '@ionic/react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export const usePushNotifications = () => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const { user } = useAuth();
  const isMobileApp = isPlatform('capacitor');

  const registerNotifications = async () => {
    if (!isMobileApp) return;
    
    try {
      // Request permission to use push notifications
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        // Register with FCM or APNS
        await PushNotifications.register();
        
        // Clear old notifications
        await PushNotifications.removeAllDeliveredNotifications();
      } 
      else {
        console.log('Push notification permission denied');
      }
    } 
    catch (error) {
      console.error('Error registering for push notifications', error);
    }
  };

  const saveTokenToDatabase = async (token: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('profile_push_tokens')
        .upsert({
          user_id: user.id,
          push_token: token,
          device_type: isPlatform('ios') ? 'ios' : 'android',
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'user_id, push_token'
        });
        
      if (error) throw error;
    } 
    catch (error) {
      console.error('Error saving push token to database', error);
    }
  };

  useEffect(() => {
    if (!isMobileApp) return;
    
    // Initialize push notification listeners
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      setPushToken(token.value);
      saveTokenToDatabase(token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);
      // Show toast for notifications received while app is in foreground
      toast.info(notification.title || 'New notification', {
        description: notification.body,
        duration: 4000,
      });
    });

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification) => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
      }
    );

    // Register for push if we have a user
    if (user?.id) {
      registerNotifications();
    }

    return () => {
      // Remove listeners when component unmounts
      PushNotifications.removeAllListeners();
    };
  }, [isMobileApp, user?.id]);

  return {
    pushToken,
    registerNotifications
  };
};
