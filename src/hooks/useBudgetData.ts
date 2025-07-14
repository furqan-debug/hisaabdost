
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
  
  console.log("useBudgetData: initializing for month", monthKey, "user:", user?.id);
  
  // Initialize Finny data sync
  useFinnyDataSync();
  
  // Simplified refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  // Simplified event handling
  useEffect(() => {
    const handleBudgetUpdate = () => {
      console.log("Budget update detected in useBudgetData");
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
  const queryResults = useBudgetQueries(selectedMonth, refreshTrigger);
  console.log("useBudgetData: query results", queryResults);
  
  // Ensure we have valid data structure
  if (!queryResults) {
    console.error("useBudgetData: No query results received");
    return null;
  }
  
  const { budgets = [], expenses = [], incomeData = { monthlyIncome: 0 }, isLoading = false } = queryResults;
  
  // Use the separated calculations hook
  const calculatedValues = useBudgetCalculations(budgets, expenses, incomeData, isLoading, selectedMonth);
  console.log("useBudgetData: calculated values", calculatedValues);

  // Export function wrapper
  const handleExportBudgetData = () => {
    console.log("Exporting budget data");
    if (exportBudgetData) {
      exportBudgetData(budgets, expenses, selectedMonth);
    }
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

  const result = {
    budgets: budgets || [],
    expenses: expenses || [],
    isLoading,
    exportBudgetData: handleExportBudgetData,
    budgetNotificationData,
    ...calculatedValues
  };
  
  console.log("useBudgetData: returning result", result);
  return result;
}
