
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
  enabled?: boolean;
}

export function useNotificationTriggers({
  budgets = [],
  monthlyExpenses = 0,
  monthlyIncome = 0,
  walletBalance = 0,
  expenses = [],
  previousMonthExpenses = 0,
  enabled = true,
}: NotificationTriggersProps) {
  const { addNotification, settings } = useNotifications();
  const { selectedMonth } = useMonthContext();
  const processedSession = useRef<Set<string>>(new Set());
  const lastProcessedData = useRef<string>('');

  // Ensure all dependencies are defined with safe defaults
  const safeBudgets = budgets || [];
  const safeExpenses = expenses || [];
  const safeMonthlyExpenses = monthlyExpenses || 0;
  const safeMonthlyIncome = monthlyIncome || 0;
  const safeWalletBalance = walletBalance || 0;
  const safePreviousMonthExpenses = previousMonthExpenses || 0;
  const safeSelectedMonth = selectedMonth || new Date();
  
  // Ensure settings has default values to prevent undefined errors
  const safeSettings = settings || {
    budgetWarnings: true,
    overspendingAlerts: true,
    monthlyReset: true,
    dailyReminders: true,
    weeklyReports: true,
    categoryInsights: true,
    savingsUpdates: true,
  };

  // Reasonable requirements for notifications
  const hasSignificantData = safeExpenses.length >= 5 && safeMonthlyExpenses > 100;
  const hasEstablishedBudgets = safeBudgets.length >= 1 || safeExpenses.length >= 10; // Allow notifications even without budgets if user has expenses
  const hasIncomeData = safeMonthlyIncome > 0;
  const isEstablishedUser = hasSignificantData && hasEstablishedBudgets && hasIncomeData;

  // Create a data signature to prevent duplicate processing
  const currentDataSignature = JSON.stringify({
    expenseCount: safeExpenses.length,
    monthlyExpenses: Math.round(safeMonthlyExpenses),
    monthlyIncome: Math.round(safeMonthlyIncome),
    walletBalance: Math.round(safeWalletBalance),
    budgetCount: safeBudgets.length,
    selectedMonth: safeSelectedMonth
  });

  // Prevent processing if data hasn't changed
  useEffect(() => {
    if (lastProcessedData.current === currentDataSignature) {
      return;
    }
    lastProcessedData.current = currentDataSignature;
  }, [currentDataSignature]);

  console.log('Notification triggers check:', {
    isEstablishedUser,
    hasSignificantData,
    hasEstablishedBudgets,
    hasIncomeData,
    expenseCount: safeExpenses.length,
    monthlyExpenses: safeMonthlyExpenses,
    budgetCount: safeBudgets.length,
    processedSessionSize: processedSession.current.size
  });

  // Only process notifications for established users and when enabled
  if (!isEstablishedUser || !enabled) {
    console.log('Skipping all notifications - user needs more established data or notifications disabled');
    return;
  }

  // Budget warnings - only for severe cases and once per session per category
  useEffect(() => {
    if (!safeSettings.budgetWarnings && !safeSettings.overspendingAlerts) return;
    if (lastProcessedData.current !== currentDataSignature) return;
    
    safeBudgets.forEach(({ category, budget, spent }) => {
      if (budget <= 0 || spent <= 0) return;
      
      const sessionKey = `budget-${category}-${safeSelectedMonth}`;
      if (processedSession.current.has(sessionKey)) return;
      
      const percentage = (spent / budget) * 100;
      
      // Only notify for critical budget issues
      if (safeSettings.overspendingAlerts && percentage > 200 && spent > 1000) {
        if (NotificationService.canSendNotification('budget-exceeded', category)) {
          const notification = NotificationService.createNotification({
            type: 'budget-exceeded',
            category,
            percentage: Math.round(percentage),
          });
          
          addNotification(notification);
          NotificationService.markNotificationSent('budget-exceeded', category);
          processedSession.current.add(sessionKey);
        }
      }
      // Very high threshold for warnings
      else if (safeSettings.budgetWarnings && percentage >= 95 && percentage <= 100 && spent > 500) {
        if (NotificationService.canSendNotification('budget-warning', category)) {
          const notification = NotificationService.createNotification({
            type: 'budget-warning',
            category,
            percentage: Math.round(percentage),
          });
          
          addNotification(notification);
          NotificationService.markNotificationSent('budget-warning', category);
          processedSession.current.add(sessionKey);
        }
      }
    });
  }, [safeBudgets, addNotification, safeSettings.budgetWarnings, safeSettings.overspendingAlerts, safeSelectedMonth, currentDataSignature]);

  // Monthly comparison - only for very significant changes
  useEffect(() => {
    if (lastProcessedData.current !== currentDataSignature) return;
    
    const sessionKey = `monthly-comparison-${safeSelectedMonth}`;
    if (processedSession.current.has(sessionKey)) return;
    
    if (safeMonthlyExpenses > 1000 && safePreviousMonthExpenses > 1000) {
      const change = safeMonthlyExpenses - safePreviousMonthExpenses;
      const changePercentage = Math.abs(change / safePreviousMonthExpenses) * 100;
      
      // Only notify for very dramatic changes (>75% and >2000 currency units)
      if (changePercentage > 75 && Math.abs(change) > 2000 && 
          NotificationService.canSendNotification('monthly-comparison')) {
        
        const notification = NotificationService.createNotification({
          type: 'monthly-comparison',
          comparisonData: {
            current: safeMonthlyExpenses,
            previous: safePreviousMonthExpenses,
            change,
          },
        });
        
        addNotification(notification);
        NotificationService.markNotificationSent('monthly-comparison');
        processedSession.current.add(sessionKey);
      }
    }
  }, [safeMonthlyExpenses, safePreviousMonthExpenses, addNotification, safeSelectedMonth, currentDataSignature]);

  // Low wallet balance - only for critically low amounts
  useEffect(() => {
    if (lastProcessedData.current !== currentDataSignature) return;
    
    const sessionKey = `low-balance-${safeSelectedMonth}`;
    if (processedSession.current.has(sessionKey)) return;
    
    if (safeWalletBalance < 50 && safeWalletBalance > 0 && safeMonthlyIncome > 0) {
      const percentage = (safeWalletBalance / safeMonthlyIncome) * 100;
      
      // Only alert if balance is extremely low (less than 1% of income)
      if (percentage < 1 && NotificationService.canSendNotification('low-balance')) {
        const notification = NotificationService.createNotification({
          type: 'low-balance',
        });
        
        addNotification(notification);
        NotificationService.markNotificationSent('low-balance');
        processedSession.current.add(sessionKey);
      }
    }
  }, [safeWalletBalance, safeMonthlyIncome, addNotification, safeSelectedMonth, currentDataSignature]);

  // Savings progress - only for truly exceptional performance
  useEffect(() => {
    if (lastProcessedData.current !== currentDataSignature) return;
    
    const sessionKey = `progress-update-${safeSelectedMonth}`;
    if (processedSession.current.has(sessionKey)) return;
    
    const savingsRate = NotificationService.calculateSavingsRate(safeMonthlyIncome, safeMonthlyExpenses);
    
    // Only celebrate truly exceptional savings rates (>80%) and ensure it's a meaningful amount
    if (savingsRate >= 80 && safeMonthlyIncome > 2000 && 
        NotificationService.canSendNotification('progress-update')) {
      const notification = NotificationService.createNotification({
        type: 'progress-update',
        percentage: Math.round(savingsRate),
      });
      
      addNotification(notification);
      NotificationService.markNotificationSent('progress-update');
      processedSession.current.add(sessionKey);
    }
  }, [safeMonthlyIncome, safeMonthlyExpenses, addNotification, safeSelectedMonth, currentDataSignature]);

  // Spending insights for users without budgets
  useEffect(() => {
    if (lastProcessedData.current !== currentDataSignature) return;
    if (safeBudgets.length > 0) return; // Only for users without budgets
    
    const sessionKey = `spending-insight-${safeSelectedMonth}`;
    if (processedSession.current.has(sessionKey)) return;
    
    if (safeExpenses.length >= 10 && safeMonthlyExpenses > 500 && 
        NotificationService.canSendNotification('spending-insight')) {
      
      const avgDailySpending = safeMonthlyExpenses / 30;
      const notification = NotificationService.createNotification({
        type: 'spending-insight',
        spendingData: {
          total: safeMonthlyExpenses,
          daily: avgDailySpending,
          expenseCount: safeExpenses.length,
        },
      });
      
      addNotification(notification);
      NotificationService.markNotificationSent('spending-insight');
      processedSession.current.add(sessionKey);
    }
  }, [safeExpenses.length, safeMonthlyExpenses, safeBudgets.length, addNotification, safeSelectedMonth, currentDataSignature]);
}
