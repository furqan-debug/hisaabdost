
import { useEffect, useState } from 'react';
import { PushNotifications, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    if (Capacitor.isNativePlatform()) {
      setIsSupported(true);
      initializePushNotifications();
    } else {
      console.log('Push notifications not supported on web platform');
    }
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Request permission to use push notifications
      const result = await PushNotifications.requestPermissions();
      
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
        
        // On success, we should be able to receive notifications
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          setToken(token.value);
          // Store token for later use
          localStorage.setItem('push_token', token.value);
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
      } else {
        console.log('Push notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!token) {
      console.log('No push token available');
      return;
    }
    
    // This would typically be sent from your backend
    console.log('Test notification would be sent to token:', token);
  };

  return {
    token,
    isSupported,
    sendTestNotification,
  };
}
