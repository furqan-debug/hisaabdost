
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
  
  // Ensure we get a valid hook result with fallbacks
  const expenseRefreshResult = useExpenseRefresh();
  const refreshTrigger = expenseRefreshResult?.refreshTrigger ?? 0;
  
  // Initialize month carryover functionality
  useMonthCarryover();
  
  // Setup notification triggers with enhanced alerts - ensure all values are defined
  useNotificationTriggers({
    budgets: [], // Will be populated when budget data is available
    monthlyExpenses: monthlyExpenses || 0,
    monthlyIncome: monthlyIncome || 0,
    walletBalance: walletBalance || 0,
    expenses: Array.isArray(expenses) ? expenses : [], // Ensure expenses is always an array
    previousMonthExpenses: 0, // Could be enhanced to fetch actual previous month data
  });

  // Listen for expense update events and refresh data
  useEffect(() => {
    // Only proceed if we have valid values
    if (!selectedMonth || !queryClient) return;
    
    // Only invalidate queries if refreshTrigger is a positive number
    if (typeof refreshTrigger === 'number' && refreshTrigger > 0) {
      console.log("Refresh trigger changed, invalidating expense queries");
      const monthKey = format(selectedMonth, 'yyyy-MM');
      queryClient.invalidateQueries({ queryKey: ['expenses', monthKey] });
      queryClient.invalidateQueries({ queryKey: ['all_expenses'] });
    }
  }, [refreshTrigger, queryClient, selectedMonth]);
}
