
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useBudgetData } from '@/hooks/useBudgetData';
import { useAuth } from '@/lib/auth';

interface BudgetAlert {
  id: string;
  category: string;
  type: 'warning' | 'danger' | 'info';
  message: string;
  percentage: number;
  timestamp: number;
}

export function useSmartBudgetAlerts() {
  const { budgets, expenses } = useBudgetData();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [lastAlertCheck, setLastAlertCheck] = useState<number>(0);

  useEffect(() => {
    if (!budgets || !expenses || !user) return;

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Don't check too frequently
    if (now - lastAlertCheck < oneHour) return;

    const newAlerts: BudgetAlert[] = [];

    budgets.forEach(budget => {
      const categoryExpenses = expenses.filter(expense => expense.category === budget.category);
      const spent = categoryExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const budgetAmount = Number(budget.amount);
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      // Create alerts based on spending percentage
      if (percentage >= 100) {
        newAlerts.push({
          id: `${budget.category}-exceeded-${now}`,
          category: budget.category,
          type: 'danger',
          message: `You've exceeded your ${budget.category} budget by ${(percentage - 100).toFixed(1)}%`,
          percentage,
          timestamp: now
        });
      } else if (percentage >= 90) {
        newAlerts.push({
          id: `${budget.category}-critical-${now}`,
          category: budget.category,
          type: 'danger',
          message: `You're at ${percentage.toFixed(1)}% of your ${budget.category} budget`,
          percentage,
          timestamp: now
        });
      } else if (percentage >= 75) {
        newAlerts.push({
          id: `${budget.category}-warning-${now}`,
          category: budget.category,
          type: 'warning',
          message: `You've used ${percentage.toFixed(1)}% of your ${budget.category} budget`,
          percentage,
          timestamp: now
        });
      }
    });

    // Show new alerts as toasts
    newAlerts.forEach(alert => {
      if (alert.type === 'danger') {
        toast.error(alert.message, {
          duration: 8000,
          action: {
            label: 'View Budget',
            onClick: () => window.location.href = '/app/budget'
          }
        });
      } else if (alert.type === 'warning') {
        toast.warning(alert.message, {
          duration: 6000,
          action: {
            label: 'View Budget',
            onClick: () => window.location.href = '/app/budget'
          }
        });
      }
    });

    setAlerts(newAlerts);
    setLastAlertCheck(now);
  }, [budgets, expenses, user, lastAlertCheck]);

  return {
    alerts,
    hasWarnings: alerts.some(alert => alert.type === 'warning'),
    hasCritical: alerts.some(alert => alert.type === 'danger'),
    clearAlerts: () => setAlerts([])
  };
}
