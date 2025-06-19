
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
  // Much longer cooldown periods to prevent spam
  private static readonly NOTIFICATION_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 days (was 48 hours)
  private static readonly WEEKLY_COOLDOWN = 14 * 24 * 60 * 60 * 1000; // 14 days (was 7 days)
  private static readonly MONTHLY_COOLDOWN = 30 * 24 * 60 * 60 * 1000; // 30 days
  private static readonly DAILY_LIMIT = 2; // Maximum 2 notifications per day
  private static readonly SESSION_LIMIT = 1; // Maximum 1 notification per session
  
  private static lastNotifications: Record<string, number> = {};
  private static dailyCount: Record<string, { date: string; count: number }> = {};
  private static sessionCount = 0;

  static canSendNotification(type: NotificationType, category?: string): boolean {
    // Check session limit first
    if (this.sessionCount >= this.SESSION_LIMIT) {
      console.log('Session notification limit reached');
      return false;
    }

    // Check daily limit
    const today = new Date().toDateString();
    const dailyKey = `daily-${today}`;
    
    if (!this.dailyCount[dailyKey]) {
      this.dailyCount[dailyKey] = { date: today, count: 0 };
    }
    
    if (this.dailyCount[dailyKey].count >= this.DAILY_LIMIT) {
      console.log('Daily notification limit reached');
      return false;
    }

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
    
    // Only monthly reset can bypass cooldown completely
    if (type === 'monthly-reset') {
      return true;
    }
    
    const canSend = (now - lastSent) > cooldownPeriod;
    
    if (!canSend) {
      console.log(`Notification ${type} blocked by cooldown`);
    }
    
    return canSend;
  }

  static markNotificationSent(type: NotificationType, category?: string): void {
    const key = category ? `${type}-${category}` : type;
    const now = Date.now();
    
    this.lastNotifications[key] = now;
    
    // Update daily count
    const today = new Date().toDateString();
    const dailyKey = `daily-${today}`;
    
    if (!this.dailyCount[dailyKey]) {
      this.dailyCount[dailyKey] = { date: today, count: 0 };
    }
    
    this.dailyCount[dailyKey].count++;
    this.sessionCount++;
    
    console.log(`Notification sent: ${type}, Daily: ${this.dailyCount[dailyKey].count}/${this.DAILY_LIMIT}, Session: ${this.sessionCount}/${this.SESSION_LIMIT}`);
  }

  // Much stricter thresholds for notifications
  static shouldTriggerBudgetWarning(spent: number, budget: number): boolean {
    if (budget <= 0 || spent <= 0) return false;
    const percentage = (spent / budget) * 100;
    return percentage >= 90; // Only warn at 90% (was 85%)
  }

  static shouldTriggerOverspending(spent: number, budget: number): boolean {
    if (budget <= 0) return false;
    return spent > budget * 1.25; // Only trigger for 25% overspending (was 10%)
  }

  static shouldTriggerBudgetExceeded(spent: number, budget: number): boolean {
    if (budget <= 0) return false;
    const percentage = (spent / budget) * 100;
    return percentage > 150; // Only trigger for major overspending (was 110%)
  }

  static shouldTriggerUnusualExpense(todayExpenses: number, dailyAverage: number): boolean {
    return todayExpenses > dailyAverage * 5 && dailyAverage > 50; // 5x average and higher minimum (was 3x and 10)
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
          description: `You're significantly overspending on ${trigger.category} this month. Consider reviewing your expenses.`,
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
          title: 'Unusually High Daily Spending',
          description: `Today's spending of ${trigger.amount?.toFixed(2)} is significantly higher than your usual daily average.`,
        };

      case 'monthly-comparison':
        return {
          type: 'info',
          title: 'Monthly Spending Update',
          description: trigger.comparisonData?.change && trigger.comparisonData.change > 0 
            ? `You've spent ${Math.abs(trigger.comparisonData.change).toFixed(2)} more than last month.`
            : `Great job! You've saved ${Math.abs(trigger.comparisonData?.change || 0).toFixed(2)} compared to last month.`,
        };

      case 'progress-update':
        return {
          type: 'success',
          title: 'Excellent Savings Progress',
          description: `Outstanding! You've saved ${trigger.percentage}% of your income this month.`,
        };

      case 'low-balance':
        return {
          type: 'warning',
          title: 'Low Wallet Balance',
          description: `Your wallet balance is running low. Consider adding funds or reviewing your spending.`,
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
