
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
  console.log('🚀 useNotificationTriggers called with props:', {
    budgets: budgets?.length || 'undefined',
    monthlyExpenses,
    monthlyIncome,
    walletBalance,
    expenses: expenses?.length || 'undefined',
    previousMonthExpenses,
    enabled
  });

  // Early return to test if this hook is causing the error
  console.log('⚠️ TEMPORARY: useNotificationTriggers disabled for debugging');
  return;

  /* TEMPORARILY DISABLED - ALL CODE BELOW
  const { addNotification, settings } = useNotifications();
  const { selectedMonth } = useMonthContext();
  const processedSession = useRef<Set<string>>(new Set());
  const lastProcessedData = useRef<string>('');

  // Early return if critical dependencies are not ready
  if (!addNotification) {
    console.log('⚠️ addNotification not ready, skipping notification triggers');
    return;
  }

  if (!selectedMonth) {
    console.log('⚠️ selectedMonth not ready, skipping notification triggers');
    return;
  }

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

  // ALL useEffect HOOKS DISABLED FOR DEBUGGING
  */
}
