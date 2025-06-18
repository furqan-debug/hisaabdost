
import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAnalyticsInsights } from '@/hooks/useAnalyticsInsights';
import { NotificationService } from '@/services/notificationService';

interface Expense {
  amount: number;
  category: string;
  date: string;
  description: string;
}

interface AnalyticsNotificationsProps {
  expenses: Expense[];
}

export function useAnalyticsNotifications({ expenses }: AnalyticsNotificationsProps) {
  const { addNotification } = useNotifications();
  const insights = useAnalyticsInsights(expenses);

  useEffect(() => {
    if (insights.length === 0) return;

    // Add insights as notifications
    insights.forEach((insight) => {
      // Create a unique key for each insight to prevent duplicates
      const insightKey = `analytics-${insight.type}-${insight.message.slice(0, 50)}`;
      
      // Check if we can send this type of notification
      if (NotificationService.canSendNotification('category-insight')) {
        const notification = {
          type: insight.type === 'warning' ? 'warning' as const : 
                insight.type === 'success' ? 'success' as const :
                insight.type === 'alert' ? 'error' as const : 'info' as const,
          title: insight.type === 'highlight' ? '📊 Spending Insight' :
                 insight.type === 'alert' ? '⚠️ Spending Alert' :
                 insight.type === 'warning' ? '⚠️ Budget Warning' :
                 insight.type === 'success' ? '✅ Great Progress' :
                 insight.type === 'tip' ? '💡 Money Tip' : '📋 Financial Update',
          description: insight.message + (insight.recommendation ? ` ${insight.recommendation}` : ''),
        };

        addNotification(notification);
        NotificationService.markNotificationSent('category-insight');
      }
    });
  }, [insights, addNotification]);

  return { insights };
}
