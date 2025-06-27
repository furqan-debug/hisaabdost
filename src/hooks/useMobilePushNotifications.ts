
import { useEffect } from 'react';
import { usePushNotifications } from './usePushNotifications';
import { PushNotificationService } from '@/services/pushNotificationService';
import { useAuth } from '@/lib/auth';
import { Capacitor } from '@capacitor/core';

export function useMobilePushNotifications() {
  const { token, isSupported } = usePushNotifications();
  const { user } = useAuth();

  useEffect(() => {
    if (token && user && Capacitor.isNativePlatform()) {
      // Store the push token for this user
      const platform = Capacitor.getPlatform() as 'ios' | 'android';
      PushNotificationService.storePushToken(user.id, token, platform);
    }
  }, [token, user]);

  return {
    isSupported,
    token,
  };
}
