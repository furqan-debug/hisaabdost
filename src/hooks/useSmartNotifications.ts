
import { useState } from 'react';
import { EnhancedSmartNotificationService } from '@/services/enhancedSmartNotificationService';

export function useSmartNotifications() {
  const [isLoading, setIsLoading] = useState(false);

  const triggerSmartNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await EnhancedSmartNotificationService.triggerSmartNotifications();
      console.log('Smart notifications triggered:', result);
      return result;
    } catch (error) {
      console.error('Failed to trigger smart notifications:', error);
      throw error;
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
