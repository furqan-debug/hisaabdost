
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
    // Skip for new accounts or if no meaningful insights
    if (insights.length === 0) return;
    if (expenses.length <= 5) return;
    
    // Limit to just one notification even if there are multiple insights
    // This prevents notification spam from analytics
    const mostImportantInsight = insights
      .sort((a, b) => {
        // Prioritize alerts, then warnings, then others
        const priorityA = a.type === 'alert' ? 3 : a.type === 'warning' ? 2 : 1;
        const priorityB = b.type === 'alert' ? 3 : b.type === 'warning' ? 2 : 1;
        return priorityB - priorityA;
      })
      .slice(0, 1)[0];
      
    if (mostImportantInsight && NotificationService.canSendNotification('category-insight')) {
      const notificationType = 
        mostImportantInsight.type === 'warning' ? 'warning' as const : 
        mostImportantInsight.type === 'success' ? 'success' as const :
        mostImportantInsight.type === 'alert' ? 'error' as const : 'info' as const;
        
      const notificationTitle = 
        mostImportantInsight.type === 'highlight' ? '📊 Spending Insight' :
        mostImportantInsight.type === 'alert' ? '⚠️ Spending Alert' :
        mostImportantInsight.type === 'warning' ? '⚠️ Budget Warning' :
        mostImportantInsight.type === 'success' ? '✅ Great Progress' :
        mostImportantInsight.type === 'tip' ? '💡 Money Tip' : '📋 Financial Update';
        
      const notification = {
        type: notificationType,
        title: notificationTitle,
        description: mostImportantInsight.message + (mostImportantInsight.recommendation 
          ? ` ${mostImportantInsight.recommendation}` : ''),
      };

      addNotification(notification);
      NotificationService.markNotificationSent('category-insight');
    }
  }, [insights, addNotification, expenses.length]);

  return { insights };
}
