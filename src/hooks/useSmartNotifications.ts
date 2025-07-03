
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { EnhancedSmartNotificationService } from '@/services/enhancedSmartNotificationService';

export function useSmartNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const triggerSmartNotifications = async () => {
    setIsLoading(true);
    try {
      console.log('🎯 Triggering smart notifications manually...');
      
      const result = await EnhancedSmartNotificationService.triggerSmartNotifications();
      
      console.log('Smart notifications result:', result);
      
      if (result.success) {
        toast({
          title: "Smart Notifications Triggered! 🧠",
          description: `Analyzed ${result.analyzed_users || 0} users and sent ${result.notifications_sent || 0} notifications`,
        });
      } else {
        throw new Error(result.error || 'Unknown error');
      }
      
      return result;
    } catch (error) {
      console.error('Failed to trigger smart notifications:', error);
      toast({
        title: "Error",
        description: "Failed to trigger smart notifications. Check console for details.",
        variant: "destructive",
      });
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
