
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { useAuth } from "@/lib/auth";
import { useBudgetQueries } from "./useBudgetQueries";
import { useBudgetCalculations } from "./useBudgetCalculations";
import { exportBudgetData } from "@/services/budgetExportService";
import { useFinnyDataSync } from "./useFinnyDataSync";

export function useBudgetData() {
  const { selectedMonth } = useMonthContext();
  const { user } = useAuth();
  const monthKey = format(selectedMonth, 'yyyy-MM');
  const queryClient = useQueryClient();
  
  // Initialize Finny data sync
  useFinnyDataSync();
  
  // Simplified refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  // Simplified event handling
  useEffect(() => {
    const handleBudgetUpdate = () => {
      console.log("Budget update detected");
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['monthly_income'] });
      setRefreshTrigger(Date.now());
    };
    
    const eventTypes = [
      'budget-updated', 
      'budget-deleted', 
      'budget-added',
      'income-updated',
      'expense-added'
    ];
    
    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleBudgetUpdate);
    });
    
    return () => {
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleBudgetUpdate);
      });
    };
  }, [queryClient]);
  
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
