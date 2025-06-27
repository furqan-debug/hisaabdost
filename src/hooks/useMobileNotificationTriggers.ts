
import { useEffect, useRef } from 'react';
import { PushNotificationService } from '@/services/pushNotificationService';
import { NotificationService, NotificationType } from '@/services/notificationService';
import { useMonthContext } from '@/hooks/use-month-context';
import { useAuth } from '@/lib/auth';
import { Capacitor } from '@capacitor/core';

interface BudgetData {
  category: string;
  budget: number;
  spent: number;
}

interface MobileNotificationTriggersProps {
  budgets?: BudgetData[];
  monthlyExpenses?: number;
  monthlyIncome?: number;
  walletBalance?: number;
  expenses?: any[];
  previousMonthExpenses?: number;
}

export function useMobileNotificationTriggers({
  budgets = [],
  monthlyExpenses = 0,
  monthlyIncome = 0,
  walletBalance = 0,
  expenses = [],
  previousMonthExpenses = 0,
}: MobileNotificationTriggersProps) {
  const { selectedMonth } = useMonthContext();
  const { user } = useAuth();
  const processedSession = useRef<Set<string>>(new Set());
  const lastProcessedData = useRef<string>('');

  // Only process for mobile platforms and authenticated users
  const shouldProcess = Capacitor.isNativePlatform() && user;

  // Very strict requirements to prevent spam for new users
  const hasSignificantData = expenses.length >= 20 && monthlyExpenses > 500;
  const hasEstablishedBudgets = budgets.length >= 3 && budgets.some(b => b.budget > 100);
  const hasIncomeData = monthlyIncome > 1000;
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

  useEffect(() => {
    if (lastProcessedData.current === currentDataSignature) {
      return;
    }
    lastProcessedData.current = currentDataSignature;
  }, [currentDataSignature]);

  // Only process notifications for established users on mobile
  if (!shouldProcess || !isEstablishedUser) {
    return;
  }

  // Budget warnings - only for severe cases
  useEffect(() => {
    if (lastProcessedData.current !== currentDataSignature) return;
    
    budgets.forEach(({ category, budget, spent }) => {
      if (budget <= 0 || spent <= 0) return;
      
      const sessionKey = `budget-${category}-${selectedMonth}`;
      if (processedSession.current.has(sessionKey)) return;
      
      const percentage = (spent / budget) * 100;
      
      // Only notify for critical budget issues
      if (percentage > 200 && spent > 1000) {
        if (NotificationService.canSendNotification('budget-exceeded', category)) {
          PushNotificationService.createAndSendPushNotification({
            type: 'budget-exceeded',
            category,
            percentage: Math.round(percentage),
          }, user!.id);
          
          processedSession.current.add(sessionKey);
        }
      }
      // Very high threshold for warnings
      else if (percentage >= 95 && percentage <= 100 && spent > 500) {
        if (NotificationService.canSendNotification('budget-warning', category)) {
          PushNotificationService.createAndSendPushNotification({
            type: 'budget-warning',
            category,
            percentage: Math.round(percentage),
          }, user!.id);
          
          processedSession.current.add(sessionKey);
        }
      }
    });
  }, [budgets, selectedMonth, currentDataSignature, user]);

  // Low wallet balance - only for critically low amounts
  useEffect(() => {
    if (lastProcessedData.current !== currentDataSignature) return;
    
    const sessionKey = `low-balance-${selectedMonth}`;
    if (processedSession.current.has(sessionKey)) return;
    
    if (walletBalance < 50 && walletBalance > 0 && monthlyIncome > 0) {
      const percentage = (walletBalance / monthlyIncome) * 100;
      
      // Only alert if balance is extremely low (less than 1% of income)
      if (percentage < 1 && NotificationService.canSendNotification('low-balance')) {
        PushNotificationService.createAndSendPushNotification({
          type: 'low-balance',
        }, user!.id);
        
        processedSession.current.add(sessionKey);
      }
    }
  }, [walletBalance, monthlyIncome, selectedMonth, currentDataSignature, user]);
}
