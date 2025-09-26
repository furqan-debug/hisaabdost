
import { supabase } from '@/integrations/supabase/client';

interface NotificationAnalytics {
  id: string;
  notification_type: string;
  priority_score: number;
  sent_at: string;
  financial_context: any;
  ai_reasoning: string;
}

export class EnhancedSmartNotificationService {
  
  static async triggerSmartNotifications(): Promise<{
    success: boolean;
    analyzed_users?: number;
    notifications_generated?: number;
    notifications_sent?: number;
    automated?: boolean;
    error?: string;
  }> {
    try {
      console.log('🧠 Triggering enhanced smart notifications...');
      
      const { data, error } = await supabase.functions.invoke('smart-push-notifications', {
        body: {
          automated: false,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('Enhanced smart notification error:', error);
        throw error;
      }

      console.log('Enhanced smart notifications result:', data);
      return data;
    } catch (error) {
      console.error('Failed to trigger enhanced smart notifications:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getNotificationAnalytics(): Promise<NotificationAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('notification_analytics')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notification analytics:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch notification analytics:', error);
      return [];
    }
  }

  static async getNotificationStats(): Promise<{
    totalSent: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    averagePriority: number;
    lastSent?: string;
  }> {
    try {
      const analytics = await this.getNotificationAnalytics();
      
      const stats = {
        totalSent: analytics.length,
        byType: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        averagePriority: 0,
        lastSent: analytics[0]?.sent_at
      };

      // Group by type
      analytics.forEach(item => {
        stats.byType[item.notification_type] = (stats.byType[item.notification_type] || 0) + 1;
        const priority = item.priority_score.toString();
        stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
      });

      // Calculate average priority
      if (analytics.length > 0) {
        stats.averagePriority = analytics.reduce((sum, item) => sum + item.priority_score, 0) / analytics.length;
      }

      return stats;
    } catch (error) {
      console.error('Failed to calculate notification stats:', error);
      return {
        totalSent: 0,
        byType: {},
        byPriority: {},
        averagePriority: 0
      };
    }
  }

  static async scheduleDaily(): Promise<void> {
    // This is now handled by the database cron job
    // The cron job will automatically trigger the function daily at 8 AM UTC
    console.log('📅 Smart notifications are scheduled to run daily at 8 AM UTC via database cron job');
  }
}
