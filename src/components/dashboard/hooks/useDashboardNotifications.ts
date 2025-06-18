
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNotificationTriggers } from "@/hooks/useNotificationTriggers";
import { useMonthCarryover } from "@/hooks/useMonthCarryover";
import { format } from "date-fns";
import { useExpenseRefresh } from "@/hooks/useExpenseRefresh";

interface DashboardNotificationsProps {
  monthlyExpenses: number;
  monthlyIncome: number;
  walletBalance: number;
  expenses: any[];
  selectedMonth: Date;
}

export function useDashboardNotifications({
  monthlyExpenses,
  monthlyIncome,
  walletBalance,
  expenses,
  selectedMonth
}: DashboardNotificationsProps) {
  const queryClient = useQueryClient();
  const { refreshTrigger } = useExpenseRefresh();
  
  // Initialize month carryover functionality
  useMonthCarryover();
  
  // Setup notification triggers with enhanced alerts
  useNotificationTriggers({
    budgets: [], // Will be populated when budget data is available
    monthlyExpenses,
    monthlyIncome,
    walletBalance,
    expenses, // Add expenses for more detailed notifications
    previousMonthExpenses: 0, // Could be enhanced to fetch actual previous month data
  });

  // Listen for expense update events and refresh data
  useEffect(() => {
    // Ensure we have valid values before proceeding
    const safeRefreshTrigger = refreshTrigger ?? 0;
    const safeSelectedMonth = selectedMonth ?? new Date();
    
    if (safeRefreshTrigger > 0) {
      console.log("Refresh trigger changed, invalidating expense queries");
      queryClient.invalidateQueries({ queryKey: ['expenses', format(safeSelectedMonth, 'yyyy-MM')] });
      queryClient.invalidateQueries({ queryKey: ['all_expenses'] });
    }
  }, [refreshTrigger, queryClient, selectedMonth]);
}
