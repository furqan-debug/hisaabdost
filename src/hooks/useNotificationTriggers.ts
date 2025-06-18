
import { useEffect, useRef } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationService, NotificationType } from '@/services/notificationService';
import { useMonthContext } from '@/hooks/use-month-context';
import { format, startOfDay, isToday, subMonths, startOfWeek, endOfWeek } from 'date-fns';

interface BudgetData {
  category: string;
  budget: number;
  spent: number;
}

interface NotificationTriggersProps {
  budgets?: BudgetData[];
  monthlyExpenses?: number;
  monthlyIncome?: number;
  walletBalance?: number;
  expenses?: any[];
  previousMonthExpenses?: number;
}

export function useNotificationTriggers({
  budgets = [],
  monthlyExpenses = 0,
  monthlyIncome = 0,
  walletBalance = 0,
  expenses = [],
  previousMonthExpenses = 0,
}: NotificationTriggersProps) {
  const { addNotification, settings } = useNotifications();
  const { selectedMonth } = useMonthContext();
  const processedMonth = useRef<string>('');
  const lastBudgetChecks = useRef<Record<string, { spent: number; timestamp: number }>>({});

  // Only trigger notifications if user has meaningful data
  const hasMinimumData = expenses.length >= 3 || monthlyExpenses > 0;

  // Check budget warnings and overspending - only for users with budgets
  useEffect(() => {
    if (!settings.budgetWarnings && !settings.overspendingAlerts) return;
    if (!hasMinimumData || budgets.length === 0) return;
    
    budgets.forEach(({ category, budget, spent }) => {
      if (budget <= 0 || spent <= 0) return;
      
      const lastCheck = lastBudgetChecks.current[category];
      const now = Date.now();
      
      // Only check if spending has changed significantly
      if (lastCheck && Math.abs(lastCheck.spent - spent) < (budget * 0.1)) {
        return;
      }
      
      lastBudgetChecks.current[category] = { spent, timestamp: now };
      
      const percentage = (spent / budget) * 100;
      
      // Budget exceeded notification (>110% to avoid minor overruns)
      if (settings.overspendingAlerts && percentage > 110) {
        if (NotificationService.canSendNotification('budget-exceeded', category)) {
          const notification = NotificationService.createNotification({
            type: 'budget-exceeded',
            category,
            percentage,
          });
          
          addNotification(notification);
          NotificationService.markNotificationSent('budget-exceeded', category);
        }
      }
      // Budget warning notification (85-100%)
      else if (settings.budgetWarnings && percentage >= 85 && percentage <= 100) {
        if (NotificationService.canSendNotification('budget-warning', category)) {
          const notification = NotificationService.createNotification({
            type: 'budget-warning',
            category,
            percentage: Math.round(percentage),
          });
          
          addNotification(notification);
          NotificationService.markNotificationSent('budget-warning', category);
        }
      }
    });
  }, [budgets, addNotification, settings.budgetWarnings, settings.overspendingAlerts, hasMinimumData]);

  // Monthly comparison - only if user has substantial historical data
  useEffect(() => {
    if (!hasMinimumData) return;
    if (monthlyExpenses > 0 && previousMonthExpenses > 0) {
      const change = monthlyExpenses - previousMonthExpenses;
      const changePercentage = Math.abs(change / previousMonthExpenses) * 100;
      
      // Only notify if change is very significant (>25%)
      if (changePercentage > 25 && NotificationService.canSendNotification('monthly-comparison')) {
        const notification = NotificationService.createNotification({
          type: 'monthly-comparison',
          comparisonData: {
            current: monthlyExpenses,
            previous: previousMonthExpenses,
            change,
          },
        });
        
        addNotification(notification);
        NotificationService.markNotificationSent('monthly-comparison');
      }
    }
  }, [monthlyExpenses, previousMonthExpenses, addNotification, hasMinimumData]);

  // Low wallet balance - only for established users
  useEffect(() => {
    if (!hasMinimumData || monthlyIncome <= 0) return;
    
    if (walletBalance < 50 && walletBalance > 0) {
      const percentage = (walletBalance / monthlyIncome) * 100;
      
      if (percentage < 5 && NotificationService.canSendNotification('low-balance')) {
        const notification = NotificationService.createNotification({
          type: 'low-balance',
        });
        
        addNotification(notification);
        NotificationService.markNotificationSent('low-balance');
      }
    }
  }, [walletBalance, monthlyIncome, addNotification, hasMinimumData]);

  // Savings progress - only for users with income and expenses
  useEffect(() => {
    if (!hasMinimumData || monthlyIncome <= 0 || monthlyExpenses <= 0) return;
    
    const savingsRate = NotificationService.calculateSavingsRate(monthlyIncome, monthlyExpenses);
    
    // Only celebrate significant savings rates (>30%)
    if (savingsRate >= 30 && NotificationService.canSendNotification('progress-update')) {
      const notification = NotificationService.createNotification({
        type: 'progress-update',
        percentage: Math.round(savingsRate),
      });
      
      addNotification(notification);
      NotificationService.markNotificationSent('progress-update');
    }
  }, [monthlyIncome, monthlyExpenses, addNotification, hasMinimumData]);
}
