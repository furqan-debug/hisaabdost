
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
    // Only send notifications if user has meaningful data (at least 5 expenses)
    if (!expenses || expenses.length < 5) return;
    
    // Only process significant insights (not tips or basic highlights)
    const significantInsights = insights.filter(insight => 
      insight.type === 'alert' || insight.type === 'warning'
    );

    if (significantInsights.length === 0) return;

    // Limit to maximum 2 insights per session to avoid spam
    significantInsights.slice(0, 2).forEach((insight) => {
      const insightKey = `analytics-${insight.type}-${insight.message.slice(0, 30)}`;
      
      if (NotificationService.canSendNotification('category-insight')) {
        const notification = {
          type: insight.type === 'warning' ? 'warning' as const : 
                insight.type === 'alert' ? 'error' as const : 'info' as const,
          title: insight.type === 'alert' ? '⚠️ Spending Alert' :
                 insight.type === 'warning' ? '⚠️ Budget Warning' : '📊 Spending Insight',
          description: insight.message + (insight.recommendation ? ` ${insight.recommendation}` : ''),
        };

        addNotification(notification);
        NotificationService.markNotificationSent('category-insight');
      }
    });
  }, [insights, addNotification, expenses]);

  return { insights };
}
