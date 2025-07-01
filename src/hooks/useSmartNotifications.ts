
import { useState } from 'react';
import { EnhancedSmartNotificationService } from '@/services/enhancedSmartNotificationService';
import { toast } from 'sonner';

export function useSmartNotifications() {
  const [isLoading, setIsLoading] = useState(false);

  const triggerSmartNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await EnhancedSmartNotificationService.triggerSmartNotifications();
      
      if (result.success) {
        toast.success(
          `🧠 Smart notifications sent! Analyzed ${result.analyzed_users} users, sent ${result.notifications_sent} intelligent notifications.`
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

  const getNotificationAnalytics = async () => {
    try {
      return await EnhancedSmartNotificationService.getNotificationAnalytics();
    } catch (error) {
      console.error('Failed to get notification analytics:', error);
      return [];
    }
  };

  const getNotificationStats = async () => {
    try {
      return await EnhancedSmartNotificationService.getNotificationStats();
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return {
        totalSent: 0,
        byType: {},
        byPriority: {},
        averagePriority: 0
      };
    }
  };

  return {
    triggerSmartNotifications,
    getNotificationAnalytics,
    getNotificationStats,
    isLoading
  };
}
