
import { useEffect, useRef } from 'react';
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
  const processedSession = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Very strict requirements - only for very established users with significant data
    if (!expenses || expenses.length < 50) {
      console.log('Analytics notifications disabled - insufficient data (need 50+ expenses)');
      return;
    }

    // Calculate total spending to ensure user has meaningful financial activity
    const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    if (totalSpending < 5000) {
      console.log('Analytics notifications disabled - insufficient spending volume');
      return;
    }
    
    // Only process the most critical alert and only once per session
    const criticalInsights = insights.filter(insight => 
      insight.type === 'alert' && 
      insight.message.includes('unusually large') &&
      insight.message.includes('significant')
    );

    if (criticalInsights.length === 0) {
      console.log('No critical insights to notify about');
      return;
    }

    // Maximum 1 insight per session and only the most critical
    const sessionKey = 'critical-analytics-insight';
    if (processedSession.current.has(sessionKey)) {
      console.log('Analytics notification already sent this session');
      return;
    }

    const mostCritical = criticalInsights[0];
    
    // Additional filter: only notify for very significant amounts
    const amountMatch = mostCritical.message.match(/\$(\d+(?:\.\d+)?)/);
    const notificationAmount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    
    if (notificationAmount < 500) {
      console.log('Analytics notification amount too small to notify');
      return;
    }
    
    if (NotificationService.canSendNotification('category-insight')) {
      const notification = {
        type: 'warning' as const,
        title: '🚨 Critical Spending Alert',
        description: mostCritical.message + (mostCritical.recommendation ? ` ${mostCritical.recommendation}` : ''),
      };

      console.log('Sending critical analytics notification:', notification);
      addNotification(notification);
      NotificationService.markNotificationSent('category-insight');
      processedSession.current.add(sessionKey);
    } else {
      console.log('Analytics notification blocked by rate limiting');
    }
  }, [insights, addNotification, expenses]);

  return { insights };
}
