
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
    // Much stricter requirements - only for very established users
    if (!expenses || expenses.length < 20) {
      console.log('Analytics notifications disabled - insufficient data (need 20+ expenses)');
      return;
    }
    
    // Only process critical alerts (not tips or highlights)
    const criticalInsights = insights.filter(insight => 
      insight.type === 'alert' && insight.message.includes('unusually large')
    );

    if (criticalInsights.length === 0) {
      console.log('No critical insights to notify about');
      return;
    }

    // Maximum 1 insight per session to avoid spam
    const mostCritical = criticalInsights[0];
    
    if (NotificationService.canSendNotification('category-insight')) {
      const notification = {
        type: 'warning' as const,
        title: '⚠️ Spending Alert',
        description: mostCritical.message + (mostCritical.recommendation ? ` ${mostCritical.recommendation}` : ''),
      };

      console.log('Sending critical analytics notification:', notification);
      addNotification(notification);
      NotificationService.markNotificationSent('category-insight');
    } else {
      console.log('Analytics notification blocked by rate limiting');
    }
  }, [insights, addNotification, expenses]);

  return { insights };
}
