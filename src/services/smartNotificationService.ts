
import { supabase } from '@/integrations/supabase/client';

export class SmartNotificationService {
  static async triggerSmartNotifications(): Promise<{
    success: boolean;
    analyzed_users?: number;
    notifications_generated?: number;
    notifications_sent?: number;
    error?: string;
  }> {
    try {
      console.log('🎯 Triggering smart notifications...');
      
      const { data, error } = await supabase.functions.invoke('smart-push-notifications', {
        body: {}
      });

      if (error) {
        console.error('Smart notification error:', error);
        throw error;
      }

      console.log('Smart notifications result:', data);
      return data;
    } catch (error) {
      console.error('Failed to trigger smart notifications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async scheduleDaily(): Promise<void> {
    // This would typically be called by a cron job or scheduled task
    // For now, it's a manual trigger
    await this.triggerSmartNotifications();
  }
}
