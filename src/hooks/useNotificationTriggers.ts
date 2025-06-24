
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
  const processedSession = useRef<Set<string>>(new Set());
  const lastProcessedData = useRef<string>('');

  // Very strict requirements to prevent spam for new users
  const hasSignificantData = expenses.length >= 20 && monthlyExpenses > 500; // Much higher thresholds
  const hasEstablishedBudgets = budgets.length >= 3 && budgets.some(b => b.budget > 100);
  const hasIncomeData = monthlyIncome > 1000; // Minimum income requirement
  const isEstablishedUser = hasSignificantData && hasEstablishedBudgets && hasIncomeData;

  // Create a data signature to prevent duplicate processing
  const currentDataSignature = JSON.stringify({
    expenseCount: expenses.length,
    monthlyExpenses: Math.round(monthlyExpenses),
    monthlyIncome: Math.round(monthlyIncome),
    walletBalance: Math.round(walletBalance),
    budgetCount: budgets.length,
    selectedMonth
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
    expenseCount: expenses.length,
    monthlyExpenses,
    budgetCount: budgets.length,
    processedSessionSize: processedSession.current.size
  });

  // Only process notifications for established users
  if (!isEstablishedUser) {
    console.log('Skipping all notifications - user needs more established data');
    return;
  }

  // Budget warnings - only for severe cases and once per session per category
  useEffect(() => {
    if (!settings.budgetWarnings && !settings.overspendingAlerts) return;
    if (lastProcessedData.current !== currentDataSignature) return;
    
    budgets.forEach(({ category, budget, spent }) => {
      if (budget <= 0 || spent <= 0) return;
      
      const sessionKey = `budget-${category}-${selectedMonth}`;
      if (processedSession.current.has(sessionKey)) return;
      
      const percentage = (spent / budget) * 100;
      
      // Only notify for critical budget issues
      if (settings.overspendingAlerts && percentage > 200 && spent > 1000) {
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
      else if (settings.budgetWarnings && percentage >= 95 && percentage <= 100 && spent > 500) {
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
  }, [budgets, addNotification, settings.budgetWarnings, settings.overspendingAlerts, selectedMonth, currentDataSignature]);

  // Monthly comparison - only for very significant changes
  useEffect(() => {
    if (lastProcessedData.current !== currentDataSignature) return;
    
    const sessionKey = `monthly-comparison-${selectedMonth}`;
    if (processedSession.current.has(sessionKey)) return;
    
    if (monthlyExpenses > 1000 && previousMonthExpenses > 1000) {
      const change = monthlyExpenses - previousMonthExpenses;
      const changePercentage = Math.abs(change / previousMonthExpenses) * 100;
      
      // Only notify for very dramatic changes (>75% and >2000 currency units)
      if (changePercentage > 75 && Math.abs(change) > 2000 && 
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
        processedSession.current.add(sessionKey);
      }
    }
  }, [monthlyExpenses, previousMonthExpenses, addNotification, selectedMonth, currentDataSignature]);

  // Low wallet balance - only for critically low amounts
  useEffect(() => {
    if (lastProcessedData.current !== currentDataSignature) return;
    
    const sessionKey = `low-balance-${selectedMonth}`;
    if (processedSession.current.has(sessionKey)) return;
    
    if (walletBalance < 50 && walletBalance > 0 && monthlyIncome > 0) {
      const percentage = (walletBalance / monthlyIncome) * 100;
      
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
  }, [walletBalance, monthlyIncome, addNotification, selectedMonth, currentDataSignature]);

  // Savings progress - only for truly exceptional performance
  useEffect(() => {
    if (lastProcessedData.current !== currentDataSignature) return;
    
    const sessionKey = `progress-update-${selectedMonth}`;
    if (processedSession.current.has(sessionKey)) return;
    
    const savingsRate = NotificationService.calculateSavingsRate(monthlyIncome, monthlyExpenses);
    
    // Only celebrate truly exceptional savings rates (>80%) and ensure it's a meaningful amount
    if (savingsRate >= 80 && monthlyIncome > 2000 && 
        NotificationService.canSendNotification('progress-update')) {
      const notification = NotificationService.createNotification({
        type: 'progress-update',
        percentage: Math.round(savingsRate),
      });
      
      addNotification(notification);
      NotificationService.markNotificationSent('progress-update');
      processedSession.current.add(sessionKey);
    }
  }, [monthlyIncome, monthlyExpenses, addNotification, selectedMonth, currentDataSignature]);
}
