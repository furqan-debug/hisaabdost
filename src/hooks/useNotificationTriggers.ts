
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

  // Much stricter requirements for sending notifications
  const hasSignificantData = expenses.length >= 10 && monthlyExpenses > 100; // Increased thresholds
  const hasEstablishedBudgets = budgets.length > 0 && budgets.some(b => b.budget > 0);
  const hasIncomeData = monthlyIncome > 0;

  console.log('Notification triggers check:', {
    hasSignificantData,
    hasEstablishedBudgets,
    hasIncomeData,
    expenseCount: expenses.length,
    monthlyExpenses,
    budgetCount: budgets.length
  });

  // Check budget warnings and overspending - only for established users with significant data
  useEffect(() => {
    if (!settings.budgetWarnings && !settings.overspendingAlerts) return;
    if (!hasSignificantData || !hasEstablishedBudgets) {
      console.log('Skipping budget notifications - insufficient data');
      return;
    }
    
    // Only check once per hour to prevent spam
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    budgets.forEach(({ category, budget, spent }) => {
      if (budget <= 0 || spent <= 0) return;
      
      const lastCheck = lastBudgetChecks.current[category];
      
      // Skip if checked recently and spending hasn't changed significantly
      if (lastCheck && 
          (now - lastCheck.timestamp) < oneHour && 
          Math.abs(lastCheck.spent - spent) < (budget * 0.2)) {
        return;
      }
      
      lastBudgetChecks.current[category] = { spent, timestamp: now };
      
      const percentage = (spent / budget) * 100;
      
      // Budget exceeded notification (only for severe overspending)
      if (settings.overspendingAlerts && percentage > 150) {
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
      // Budget warning notification (only at 90%+)
      else if (settings.budgetWarnings && percentage >= 90 && percentage <= 100) {
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
  }, [budgets, addNotification, settings.budgetWarnings, settings.overspendingAlerts, hasSignificantData, hasEstablishedBudgets]);

  // Monthly comparison - only for users with substantial historical data
  useEffect(() => {
    if (!hasSignificantData || !hasIncomeData) return;
    
    if (monthlyExpenses > 0 && previousMonthExpenses > 0) {
      const change = monthlyExpenses - previousMonthExpenses;
      const changePercentage = Math.abs(change / previousMonthExpenses) * 100;
      
      // Only notify if change is very significant (>40% and substantial amount)
      if (changePercentage > 40 && Math.abs(change) > 500 && 
          NotificationService.canSendNotification('monthly-comparison')) {
        
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
  }, [monthlyExpenses, previousMonthExpenses, addNotification, hasSignificantData, hasIncomeData]);

  // Low wallet balance - only for established users with income
  useEffect(() => {
    if (!hasSignificantData || !hasIncomeData) return;
    
    if (walletBalance < 100 && walletBalance > 0) {
      const percentage = (walletBalance / monthlyIncome) * 100;
      
      // Only alert if balance is critically low (less than 2% of income)
      if (percentage < 2 && NotificationService.canSendNotification('low-balance')) {
        const notification = NotificationService.createNotification({
          type: 'low-balance',
        });
        
        addNotification(notification);
        NotificationService.markNotificationSent('low-balance');
      }
    }
  }, [walletBalance, monthlyIncome, addNotification, hasSignificantData, hasIncomeData]);

  // Savings progress - only for exceptional savings rates
  useEffect(() => {
    if (!hasSignificantData || !hasIncomeData) return;
    
    const savingsRate = NotificationService.calculateSavingsRate(monthlyIncome, monthlyExpenses);
    
    // Only celebrate exceptional savings rates (>50%)
    if (savingsRate >= 50 && NotificationService.canSendNotification('progress-update')) {
      const notification = NotificationService.createNotification({
        type: 'progress-update',
        percentage: Math.round(savingsRate),
      });
      
      addNotification(notification);
      NotificationService.markNotificationSent('progress-update');
    }
  }, [monthlyIncome, monthlyExpenses, addNotification, hasSignificantData, hasIncomeData]);
}
