
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

  // Check for monthly reset notification
  useEffect(() => {
    const currentMonthKey = format(selectedMonth, 'yyyy-MM');
    
    if (processedMonth.current && processedMonth.current !== currentMonthKey && settings.monthlyReset) {
      const monthName = format(selectedMonth, 'MMMM yyyy');
      
      if (NotificationService.canSendNotification('monthly-reset')) {
        const notification = NotificationService.createNotification({
          type: 'monthly-reset',
          monthName,
        });
        
        addNotification(notification);
        NotificationService.markNotificationSent('monthly-reset');
      }

      // Check for leftover budget to add to wallet
      const prevMonthIncome = monthlyIncome;
      const prevMonthExpenses = previousMonthExpenses;
      const leftover = prevMonthIncome - prevMonthExpenses;
      
      if (leftover > 0 && NotificationService.canSendNotification('leftover-added')) {
        const notification = NotificationService.createNotification({
          type: 'leftover-added',
          amount: leftover,
        });
        
        addNotification(notification);
        NotificationService.markNotificationSent('leftover-added');
      }
    }
    
    processedMonth.current = currentMonthKey;
  }, [selectedMonth, addNotification, settings.monthlyReset, monthlyIncome, previousMonthExpenses]);

  // Check budget warnings and overspending
  useEffect(() => {
    if (!settings.budgetWarnings && !settings.overspendingAlerts) return;
    
    budgets.forEach(({ category, budget, spent }) => {
      if (budget <= 0) return;
      
      const lastCheck = lastBudgetChecks.current[category];
      const now = Date.now();
      
      // Only check if spending has changed or it's been more than an hour
      if (lastCheck && lastCheck.spent === spent && (now - lastCheck.timestamp) < 60 * 60 * 1000) {
        return;
      }
      
      lastBudgetChecks.current[category] = { spent, timestamp: now };
      
      const percentage = (spent / budget) * 100;
      
      // Budget exceeded notification (>100%)
      if (settings.overspendingAlerts && NotificationService.shouldTriggerBudgetExceeded(spent, budget)) {
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
      // Overspending notification (spending > budget but might be exactly 100%)
      else if (settings.overspendingAlerts && NotificationService.shouldTriggerOverspending(spent, budget)) {
        if (NotificationService.canSendNotification('overspending', category)) {
          const notification = NotificationService.createNotification({
            type: 'overspending',
            category,
          });
          
          addNotification(notification);
          NotificationService.markNotificationSent('overspending', category);
        }
      }
      // Budget warning notification (80-99%)
      else if (settings.budgetWarnings && NotificationService.shouldTriggerBudgetWarning(spent, budget)) {
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
  }, [budgets, addNotification, settings.budgetWarnings, settings.overspendingAlerts]);

  // Check for unusual daily expenses
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (lastDailyCheck.current === today || expenses.length === 0) return;
    
    const todayExpenses = expenses
      .filter(expense => isToday(new Date(expense.date)))
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    // Calculate daily average from last 30 days (excluding today)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const pastExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= thirtyDaysAgo && !isToday(expenseDate);
    });
    
    const dailyAverage = pastExpenses.length > 0 
      ? pastExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0) / 30
      : 0;
    
    if (NotificationService.shouldTriggerUnusualExpense(todayExpenses, dailyAverage)) {
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
  }, [expenses, addNotification]);

  // Check for budget reminder (if no budgets set)
  useEffect(() => {
    if (budgets.length === 0 && monthlyExpenses > 0) {
      if (NotificationService.canSendNotification('budget-reminder')) {
        const notification = NotificationService.createNotification({
          type: 'budget-reminder',
        });
        
        addNotification(notification);
        NotificationService.markNotificationSent('budget-reminder');
      }
    }
  }, [budgets.length, monthlyExpenses, addNotification]);

  // Weekly spending summary
  useEffect(() => {
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
    
    if (weeklyExpenses > 0 && NotificationService.canSendNotification('weekly-summary')) {
      const notification = NotificationService.createNotification({
        type: 'weekly-summary',
        amount: weeklyExpenses,
      });
      
      addNotification(notification);
      NotificationService.markNotificationSent('weekly-summary');
    }
    
    lastWeeklyCheck.current = weekKey;
  }, [expenses, addNotification]);

  // Monthly comparison with previous month
  useEffect(() => {
    if (monthlyExpenses > 0 && previousMonthExpenses > 0) {
      const change = monthlyExpenses - previousMonthExpenses;
      const changePercentage = Math.abs(change / previousMonthExpenses) * 100;
      
      // Only notify if change is significant (>10%)
      if (changePercentage > 10 && NotificationService.canSendNotification('monthly-comparison')) {
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

  // Category insights (comparing with previous month)
  useEffect(() => {
    if (budgets.length === 0) return;
    
    budgets.forEach(({ category, spent }) => {
      // This would need historical data - simplified for now
      const previousMonthCategorySpent = 0; // Would need to fetch from previous month
      
      if (spent > 0 && previousMonthCategorySpent > 0) {
        const change = spent - previousMonthCategorySpent;
        const changePercentage = Math.abs(change / previousMonthCategorySpent) * 100;
        
        if (changePercentage > 15 && NotificationService.canSendNotification('category-insight', category)) {
          const notification = NotificationService.createNotification({
            type: 'category-insight',
            category,
            comparisonData: {
              current: spent,
              previous: previousMonthCategorySpent,
              change,
            },
          });
          
          addNotification(notification);
          NotificationService.markNotificationSent('category-insight', category);
        }
      }
    });
  }, [budgets, addNotification]);

  // Low wallet balance
  useEffect(() => {
    if (walletBalance < 100 && monthlyIncome > 0) {
      const percentage = (walletBalance / monthlyIncome) * 100;
      
      if (percentage < 10 && NotificationService.canSendNotification('low-balance')) {
        const notification = NotificationService.createNotification({
          type: 'low-balance',
        });
        
        addNotification(notification);
        NotificationService.markNotificationSent('low-balance');
      }
    }
  }, [walletBalance, monthlyIncome, addNotification]);

  // Savings progress updates
  useEffect(() => {
    const savingsRate = NotificationService.calculateSavingsRate(monthlyIncome, monthlyExpenses);
    
    if (savingsRate >= 20 && NotificationService.canSendNotification('progress-update')) {
      const notification = NotificationService.createNotification({
        type: 'progress-update',
        percentage: Math.round(savingsRate),
      });
      
      addNotification(notification);
      NotificationService.markNotificationSent('progress-update');
    }
  }, [monthlyIncome, monthlyExpenses, addNotification]);
}
