
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
  | 'progress-update'
  | 'spending-insight';

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
  spendingData?: {
    total: number;
    daily: number;
    expenseCount: number;
  };
}

export class NotificationService {
  // Much more aggressive cooldown periods
  private static readonly NOTIFICATION_COOLDOWN = 14 * 24 * 60 * 60 * 1000; // 14 days
  private static readonly WEEKLY_COOLDOWN = 21 * 24 * 60 * 60 * 1000; // 21 days
  private static readonly MONTHLY_COOLDOWN = 60 * 24 * 60 * 60 * 1000; // 60 days
  private static readonly DAILY_LIMIT = 1; // Maximum 1 notification per day
  private static readonly SESSION_LIMIT = 3; // Maximum 3 notifications per session
  private static readonly GLOBAL_SESSION_LIMIT = 1; // Maximum 1 notification per page load
  
  private static lastNotifications: Record<string, number> = {};
  private static dailyCount: Record<string, { date: string; count: number }> = {};
  private static sessionCount = 0;
  private static globalSessionCount = 0;
  private static sessionStartTime = Date.now();

  static canSendNotification(type: NotificationType, category?: string): boolean {
    // Reset session count if it's been more than 30 minutes since session start
    if (Date.now() - this.sessionStartTime > 30 * 60 * 1000) {
      this.sessionCount = 0;
      this.globalSessionCount = 0;
      this.sessionStartTime = Date.now();
    }

    // Check global session limit first (most restrictive)
    if (this.globalSessionCount >= this.GLOBAL_SESSION_LIMIT) {
      console.log('Global session notification limit reached');
      return false;
    }

    // Check session limit
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
      return this.globalSessionCount < this.GLOBAL_SESSION_LIMIT;
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
    this.globalSessionCount++;
    
    console.log(`Notification sent: ${type}, Daily: ${this.dailyCount[dailyKey].count}/${this.DAILY_LIMIT}, Session: ${this.sessionCount}/${this.SESSION_LIMIT}, Global: ${this.globalSessionCount}/${this.GLOBAL_SESSION_LIMIT}`);
  }

  // Much stricter thresholds for notifications
  static shouldTriggerBudgetWarning(spent: number, budget: number): boolean {
    if (budget <= 0 || spent <= 0) return false;
    const percentage = (spent / budget) * 100;
    return percentage >= 95; // Only warn at 95% (was 90%)
  }

  static shouldTriggerOverspending(spent: number, budget: number): boolean {
    if (budget <= 0) return false;
    return spent > budget * 2; // Only trigger for 100% overspending (was 25%)
  }

  static shouldTriggerBudgetExceeded(spent: number, budget: number): boolean {
    if (budget <= 0) return false;
    const percentage = (spent / budget) * 100;
    return percentage > 200; // Only trigger for major overspending (was 150%)
  }

  static shouldTriggerUnusualExpense(todayExpenses: number, dailyAverage: number): boolean {
    return todayExpenses > dailyAverage * 10 && dailyAverage > 100; // 10x average and higher minimum
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
          title: `Critical Budget Alert: ${trigger.category}`,
          description: `You've reached ${trigger.percentage}% of your ${trigger.category} budget. Consider reducing spending.`,
          category: trigger.category,
        };

      case 'overspending':
        return {
          type: 'error',
          title: `Severe Overspending: ${trigger.category}`,
          description: `You're significantly overspending on ${trigger.category}. Immediate attention required.`,
          category: trigger.category,
        };

      case 'budget-exceeded':
        return {
          type: 'error',
          title: `Budget Severely Exceeded: ${trigger.category}`,
          description: `You've exceeded your ${trigger.category} budget by ${trigger.percentage?.toFixed(1)}%. Take immediate action.`,
          category: trigger.category,
        };

      case 'monthly-reset':
        return {
          type: 'info',
          title: 'New Month Started',
          description: `Welcome to ${trigger.monthName}! Your monthly tracking has been reset.`,
        };

      case 'leftover-added':
        return {
          type: 'success',
          title: 'Budget Surplus Added',
          description: `${trigger.amount?.toFixed(2)} from unused budget has been added to your wallet.`,
        };

      case 'unusual-expense':
        return {
          type: 'warning',
          title: 'Extremely High Daily Spending',
          description: `Today's spending of ${trigger.amount?.toFixed(2)} is dramatically higher than normal.`,
        };

      case 'monthly-comparison':
        return {
          type: 'info',
          title: 'Significant Monthly Change',
          description: trigger.comparisonData?.change && trigger.comparisonData.change > 0 
            ? `Major increase: You've spent ${Math.abs(trigger.comparisonData.change).toFixed(2)} more than last month.`
            : `Excellent! You've saved ${Math.abs(trigger.comparisonData?.change || 0).toFixed(2)} compared to last month.`,
        };

      case 'progress-update':
        return {
          type: 'success',
          title: 'Outstanding Savings Achievement',
          description: `Exceptional performance! You've saved ${trigger.percentage}% of your income this month.`,
        };

      case 'low-balance':
        return {
          type: 'warning',
          title: 'Critical Wallet Balance',
          description: `Your wallet balance is critically low. Immediate attention needed.`,
        };

      case 'spending-insight':
        return {
          type: 'info',
          title: '💡 Spending Insight',
          description: `You've spent ${trigger.spendingData?.total?.toFixed(2)} this month across ${trigger.spendingData?.expenseCount} expenses. That's ${trigger.spendingData?.daily?.toFixed(2)} per day on average.`,
        };

      default:
        return {
          type: 'info',
          title: 'Notification',
          description: 'You have a new notification.',
        };
    }
  }

  // Reset daily counts for testing (can be removed in production)
  static resetDailyCounts(): void {
    this.dailyCount = {};
    this.sessionCount = 0;
    this.globalSessionCount = 0;
    this.sessionStartTime = Date.now();
    console.log('Notification counts reset');
  }
}
