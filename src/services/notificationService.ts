import { format } from 'date-fns';
import { Notification } from '@/hooks/useNotifications';

export type NotificationType = 
  | 'budget-warning'
  | 'overspending'
  | 'monthly-reset'
  | 'budget-exceeded'
  | 'low-balance'
  | 'savings-goal'
  | 'leftover-added'
  | 'unusual-expense'
  | 'budget-reminder'
  | 'daily-expense-reminder'
  | 'weekly-summary'
  | 'monthly-comparison'
  | 'category-insight'
  | 'progress-update';

export interface NotificationTrigger {
  type: NotificationType;
  category?: string;
  amount?: number;
  percentage?: number;
  monthName?: string;
  comparisonData?: {
    current: number;
    previous: number;
    change: number;
  };
}

export class NotificationService {
  private static readonly NOTIFICATION_COOLDOWN = 48 * 60 * 60 * 1000; // 48 hours (increased)
  private static readonly WEEKLY_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly MONTHLY_COOLDOWN = 30 * 24 * 60 * 60 * 1000; // 30 days
  private static lastNotifications: Record<string, number> = {};

  static canSendNotification(type: NotificationType, category?: string): boolean {
    const key = category ? `${type}-${category}` : type;
    const lastSent = this.lastNotifications[key] || 0;
    const now = Date.now();
    
    // Different cooldown periods for different notification types
    let cooldownPeriod = this.NOTIFICATION_COOLDOWN;
    
    if (['weekly-summary'].includes(type)) {
      cooldownPeriod = this.WEEKLY_COOLDOWN;
    }
    
    if (['monthly-comparison', 'monthly-reset', 'leftover-added'].includes(type)) {
      cooldownPeriod = this.MONTHLY_COOLDOWN;
    }
    
    // Special cases that can send immediately
    if (['monthly-reset', 'leftover-added'].includes(type)) {
      return true;
    }
    
    return (now - lastSent) > cooldownPeriod;
  }

  static markNotificationSent(type: NotificationType, category?: string): void {
    const key = category ? `${type}-${category}` : type;
    this.lastNotifications[key] = Date.now();
  }

  static shouldTriggerBudgetWarning(spent: number, budget: number): boolean {
    if (budget <= 0) return false;
    const percentage = (spent / budget) * 100;
    return percentage >= 85 && percentage < 100; // Increased threshold
  }

  static shouldTriggerOverspending(spent: number, budget: number): boolean {
    if (budget <= 0) return false;
    return spent > budget * 1.1; // Only trigger for 10% overspending
  }

  static shouldTriggerBudgetExceeded(spent: number, budget: number): boolean {
    if (budget <= 0) return false;
    const percentage = (spent / budget) * 100;
    return percentage > 110; // Only trigger for significant overspending
  }

  static shouldTriggerUnusualExpense(todayExpenses: number, dailyAverage: number): boolean {
    return todayExpenses > dailyAverage * 3 && dailyAverage > 10; // 3x the average and minimum threshold
  }

  static calculateSavingsRate(income: number, expenses: number): number {
    if (income <= 0) return 0;
    return ((income - expenses) / income) * 100;
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

      case 'leftover-added':
        return {
          type: 'success',
          title: 'Leftover Budget Added',
          description: `${trigger.amount?.toFixed(2)} from last month's unused budget has been added to your wallet automatically.`,
        };

      case 'unusual-expense':
        return {
          type: 'warning',
          title: 'Unusual Daily Expense',
          description: `Today's spending of ${trigger.amount?.toFixed(2)} is significantly higher than your usual daily average.`,
        };

      case 'budget-reminder':
        return {
          type: 'info',
          title: 'Set Monthly Budget',
          description: `Don't forget to set your budget for this month to better track your spending.`,
        };

      case 'daily-expense-reminder':
        return {
          type: 'info',
          title: 'Daily Expense Reminder',
          description: `Remember to log your expenses for today to keep your financial tracking accurate.`,
        };

      case 'weekly-summary':
        return {
          type: 'info',
          title: 'Weekly Spending Summary',
          description: `You've spent ${trigger.amount?.toFixed(2)} this week. Check your analytics for detailed insights.`,
        };

      case 'monthly-comparison':
        return {
          type: 'info',
          title: 'Monthly Spending Update',
          description: trigger.comparisonData?.change && trigger.comparisonData.change > 0 
            ? `You've spent ${Math.abs(trigger.comparisonData.change).toFixed(2)} more than last month.`
            : `Great job! You've saved ${Math.abs(trigger.comparisonData?.change || 0).toFixed(2)} compared to last month.`,
        };

      case 'category-insight':
        return {
          type: 'success',
          title: `${trigger.category} Spending Insight`,
          description: trigger.comparisonData?.change && trigger.comparisonData.change < 0
            ? `Your ${trigger.category} expenses dropped by ${Math.abs(trigger.comparisonData.change).toFixed(2)} this month. Well done!`
            : `Your ${trigger.category} expenses increased by ${trigger.comparisonData?.change?.toFixed(2)} this month.`,
        };

      case 'progress-update':
        return {
          type: 'success',
          title: 'Great Savings Progress',
          description: `Excellent! You've saved ${trigger.percentage}% of your income this month.`,
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
          description: `Congratulations! You've reached ${trigger.percentage}% of your savings goal.`,
        };

      default:
        return {
          type: 'info',
          title: 'Notification',
          description: 'You have a new notification.',
        };
    }
  }
}
