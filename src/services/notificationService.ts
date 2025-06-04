
import { format } from 'date-fns';
import { Notification } from '@/hooks/useNotifications';

export type NotificationType = 
  | 'budget-warning'
  | 'overspending'
  | 'monthly-reset'
  | 'budget-exceeded'
  | 'low-balance'
  | 'savings-goal';

export interface NotificationTrigger {
  type: NotificationType;
  category?: string;
  amount?: number;
  percentage?: number;
  monthName?: string;
}

export class NotificationService {
  private static readonly NOTIFICATION_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours
  private static lastNotifications: Record<string, number> = {};

  static canSendNotification(type: NotificationType, category?: string): boolean {
    const key = category ? `${type}-${category}` : type;
    const lastSent = this.lastNotifications[key] || 0;
    const now = Date.now();
    
    // Allow immediate sending for monthly reset
    if (type === 'monthly-reset') {
      return true;
    }
    
    return (now - lastSent) > this.NOTIFICATION_COOLDOWN;
  }

  static markNotificationSent(type: NotificationType, category?: string): void {
    const key = category ? `${type}-${category}` : type;
    this.lastNotifications[key] = Date.now();
  }

  static createNotification(trigger: NotificationTrigger): Omit<Notification, 'id' | 'timestamp' | 'read'> {
    switch (trigger.type) {
      case 'budget-warning':
        return {
          type: 'warning',
          title: `Budget Alert: ${trigger.category}`,
          description: `You've reached ${trigger.percentage}% of your ${trigger.category} budget for this month.`,
          category: trigger.category,
        };

      case 'overspending':
        return {
          type: 'error',
          title: `Overspending Alert: ${trigger.category}`,
          description: `You're overspending on ${trigger.category} this month. Consider reviewing your expenses.`,
          category: trigger.category,
        };

      case 'budget-exceeded':
        return {
          type: 'error',
          title: `Budget Exceeded: ${trigger.category}`,
          description: `You've exceeded your ${trigger.category} budget by ${trigger.percentage?.toFixed(1)}%.`,
          category: trigger.category,
        };

      case 'monthly-reset':
        return {
          type: 'info',
          title: 'New Month Started',
          description: `Welcome to ${trigger.monthName}! Your expenses and budget tracking have been reset for the new month.`,
        };

      case 'low-balance':
        return {
          type: 'warning',
          title: 'Low Wallet Balance',
          description: `Your wallet balance is running low. Consider adding funds or reviewing your spending.`,
        };

      case 'savings-goal':
        return {
          type: 'success',
          title: 'Savings Milestone',
          description: `Great job! You've saved ${trigger.percentage}% towards your monthly goal.`,
        };

      default:
        return {
          type: 'info',
          title: 'Notification',
          description: 'You have a new notification.',
        };
    }
  }

  static shouldTriggerBudgetWarning(spent: number, budget: number): boolean {
    if (budget <= 0) return false;
    const percentage = (spent / budget) * 100;
    return percentage >= 80 && percentage < 100;
  }

  static shouldTriggerOverspending(spent: number, budget: number): boolean {
    if (budget <= 0) return false;
    return spent > budget;
  }

  static shouldTriggerBudgetExceeded(spent: number, budget: number): boolean {
    if (budget <= 0) return false;
    const percentage = (spent / budget) * 100;
    return percentage > 100;
  }
}
