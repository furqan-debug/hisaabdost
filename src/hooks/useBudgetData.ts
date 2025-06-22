
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { useAuth } from "@/lib/auth";
import { useBudgetQueries } from "./useBudgetQueries";
import { useBudgetCalculations } from "./useBudgetCalculations";
import { exportBudgetData } from "@/services/budgetExportService";

export function useBudgetData() {
  const { selectedMonth } = useMonthContext();
  const { user } = useAuth();
  const monthKey = format(selectedMonth, 'yyyy-MM');
  const queryClient = useQueryClient();
  
  // Add refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = useState<number>(Date.now());
  
  // Listen for budget update events
  useEffect(() => {
    const handleBudgetUpdate = (e: Event) => {
      console.log("Budget update detected, refreshing data", e);
      
      // Immediately invalidate queries
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['monthly_income'] });
      
      // Update refresh trigger
      setRefreshTrigger(Date.now());
      
      // Force a refetch after a short delay
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['budgets', monthKey, user?.id] });
      }, 100);
    };
    
    const eventTypes = [
      'budget-updated', 
      'budget-deleted', 
      'budget-refresh',
      'income-updated',
      'income-refresh'
    ];
    
    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleBudgetUpdate);
    });
    
    return () => {
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleBudgetUpdate);
      });
    };
  }, [queryClient, monthKey, user?.id]);
  
  // Use the separated query hook
  const { budgets, expenses, incomeData, isLoading } = useBudgetQueries(selectedMonth, refreshTrigger);
  
  // Use the separated calculations hook
  const calculatedValues = useBudgetCalculations(budgets, expenses, incomeData, isLoading, selectedMonth);

  // Export function wrapper
  const handleExportBudgetData = () => {
    exportBudgetData(budgets, expenses, selectedMonth);
  };

  // Transform budgets data for notification triggers
  const budgetNotificationData = budgets?.map(budget => {
    const categoryExpenses = expenses?.filter(expense => expense.category === budget.category) || [];
    const spent = categoryExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    return {
      category: budget.category,
      budget: Number(budget.amount),
      spent,
    };
  }) || [];

  return {
    budgets,
    expenses,
    isLoading,
    exportBudgetData: handleExportBudgetData,
    budgetNotificationData,
    ...calculatedValues
  };
}
