
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
  const lastDailyCheck = useRef<string>('');
  const lastWeeklyCheck = useRef<string>('');
  
  // Determine if this is a new user account with minimal activity
  const isNewAccount = expenses.length <= 3;

  // Check for monthly reset notification - but only for accounts with some history
  useEffect(() => {
    const currentMonthKey = format(selectedMonth, 'yyyy-MM');
    
    if (processedMonth.current && 
        processedMonth.current !== currentMonthKey && 
        settings.monthlyReset && 
        !isNewAccount) {
      
      const monthName = format(selectedMonth, 'MMMM yyyy');
      
      if (NotificationService.canSendNotification('monthly-reset')) {
        const notification = NotificationService.createNotification({
          type: 'monthly-reset',
          monthName,
        });
        
        addNotification(notification);
        NotificationService.markNotificationSent('monthly-reset');
      }

      // Check for leftover budget to add to wallet - only for established accounts with data
      const prevMonthIncome = monthlyIncome;
      const prevMonthExpenses = previousMonthExpenses;
      
      // Only show this notification if there's significant leftover amount
      const leftover = prevMonthIncome - prevMonthExpenses;
      if (leftover > 0 && 
          leftover > (monthlyIncome * 0.1) && // Only if more than 10% of income
          NotificationService.canSendNotification('leftover-added')) {
        
        const notification = NotificationService.createNotification({
          type: 'leftover-added',
          amount: leftover,
        });
        
        addNotification(notification);
        NotificationService.markNotificationSent('leftover-added');
      }
    }
    
    processedMonth.current = currentMonthKey;
  }, [selectedMonth, addNotification, settings.monthlyReset, monthlyIncome, previousMonthExpenses, isNewAccount]);

  // Check budget warnings and overspending - skip for new accounts with minimal data
  useEffect(() => {
    if ((!settings.budgetWarnings && !settings.overspendingAlerts) || isNewAccount) return;
    
    // Only check budgets if we have at least 2 budgets and actual spending activity
    if (budgets.length < 2 || expenses.length < 5) return;
    
    budgets.forEach(({ category, budget, spent }) => {
      if (budget <= 0) return;
      
      const lastCheck = lastBudgetChecks.current[category];
      const now = Date.now();
      
      // Only check if spending has changed or it's been more than 12 hours (reduced frequency)
      if (lastCheck && lastCheck.spent === spent && (now - lastCheck.timestamp) < 12 * 60 * 60 * 1000) {
        return;
      }
      
      lastBudgetChecks.current[category] = { spent, timestamp: now };
      
      const percentage = (spent / budget) * 100;
      
      // Only send notifications for significant budget changes (>90% used)
      if (settings.overspendingAlerts && NotificationService.shouldTriggerBudgetExceeded(spent, budget) && spent > 50) {
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
      // We'll be more restrictive with warning notifications - only trigger at 90%+
      else if (settings.budgetWarnings && percentage >= 90 && spent > 50) {
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
  }, [budgets, addNotification, settings.budgetWarnings, settings.overspendingAlerts, isNewAccount, expenses.length]);

  // Check for unusual daily expenses - but only for established accounts
  useEffect(() => {
    if (isNewAccount || expenses.length < 10) return; // Skip for new accounts
    
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (lastDailyCheck.current === today || expenses.length === 0) return;
    
    const todayExpenses = expenses
      .filter(expense => isToday(new Date(expense.date)))
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    // Calculate daily average from past expenses
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const pastExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= thirtyDaysAgo && !isToday(expenseDate);
    });
    
    const dailyAverage = pastExpenses.length > 0 
      ? pastExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0) / 30
      : 0;
    
    // Only notify for very significant unusual expenses (3x more than average)
    if (dailyAverage > 0 && todayExpenses > dailyAverage * 3 && todayExpenses > 100) {
      if (NotificationService.canSendNotification('unusual-expense')) {
        const notification = NotificationService.createNotification({
          type: 'unusual-expense',
          amount: todayExpenses,
        });
        
        addNotification(notification);
        NotificationService.markNotificationSent('unusual-expense');
      }
    }
    
    lastDailyCheck.current = today;
  }, [expenses, addNotification, isNewAccount]);

  // Simplified weekly spending summary - only for accounts with sufficient data
  useEffect(() => {
    if (isNewAccount || expenses.length < 15) return; // Skip for new accounts
    
    const weekKey = format(startOfWeek(new Date()), 'yyyy-ww');
    
    if (lastWeeklyCheck.current === weekKey) return;
    
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    
    const weeklyExpenses = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= weekStart && expenseDate <= weekEnd;
      })
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    // Only send the weekly summary if there's meaningful spending
    if (weeklyExpenses > (monthlyIncome * 0.15) && NotificationService.canSendNotification('weekly-summary')) {
      const notification = NotificationService.createNotification({
        type: 'weekly-summary',
        amount: weeklyExpenses,
      });
      
      addNotification(notification);
      NotificationService.markNotificationSent('weekly-summary');
    }
    
    lastWeeklyCheck.current = weekKey;
  }, [expenses, addNotification, isNewAccount, monthlyIncome]);

  // All other notification types are completely disabled for new accounts
  if (!isNewAccount) {
    // Monthly comparison with previous month - for established accounts only
    useEffect(() => {
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
    }, [monthlyExpenses, previousMonthExpenses, addNotification]);
  }

  // Completely removed several notification types that weren't useful or were too aggressive:
  // - Budget reminder (for users with no budgets)
  // - Category insights (comparing with previous month)
  // - Low wallet balance
  // - Savings progress updates
}
