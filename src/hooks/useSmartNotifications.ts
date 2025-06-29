
import { useState } from 'react';
import { SmartNotificationService } from '@/services/smartNotificationService';
import { toast } from 'sonner';

export function useSmartNotifications() {
  const [isLoading, setIsLoading] = useState(false);

  const triggerSmartNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await SmartNotificationService.triggerSmartNotifications();
      
      if (result.success) {
        toast.success(
          `Smart notifications sent! Analyzed ${result.analyzed_users} users, sent ${result.notifications_sent} notifications.`
        );
      } else {
        toast.error(`Failed to send notifications: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      toast.error('Failed to trigger smart notifications');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    triggerSmartNotifications,
    isLoading
  };
}
