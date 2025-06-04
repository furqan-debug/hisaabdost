
import { useEffect, useRef } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationService, NotificationType } from '@/services/notificationService';
import { useMonthContext } from '@/hooks/use-month-context';
import { format } from 'date-fns';

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
}

export function useNotificationTriggers({
  budgets = [],
  monthlyExpenses = 0,
  monthlyIncome = 0,
  walletBalance = 0,
}: NotificationTriggersProps) {
  const { addNotification, settings } = useNotifications();
  const { selectedMonth } = useMonthContext();
  const processedMonth = useRef<string>('');
  const lastBudgetChecks = useRef<Record<string, { spent: number; timestamp: number }>>({});

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
    }
    
    processedMonth.current = currentMonthKey;
  }, [selectedMonth, addNotification, settings.monthlyReset]);

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

  // Check low wallet balance
  useEffect(() => {
    if (walletBalance < 100 && monthlyIncome > 0) { // Less than 100 in wallet
      const percentage = (walletBalance / monthlyIncome) * 100;
      
      if (percentage < 10 && NotificationService.canSendNotification('low-balance')) { // Less than 10% of income
        const notification = NotificationService.createNotification({
          type: 'low-balance',
        });
        
        addNotification(notification);
        NotificationService.markNotificationSent('low-balance');
      }
    }
  }, [walletBalance, monthlyIncome, addNotification]);
}
