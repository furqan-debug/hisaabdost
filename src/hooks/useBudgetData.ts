
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { useAuth } from "@/lib/auth";
import { useBudgetQueries } from "./useBudgetQueries";
import { useBudgetCalculations } from "./useBudgetCalculations";
import { exportBudgetData } from "@/services/budgetExportService";
import { useOptimizedDataSync } from "./useOptimizedDataSync";
import { useFinnyDataSync } from "./useFinnyDataSync";

export function useBudgetData() {
  const { selectedMonth } = useMonthContext();
  const { user } = useAuth();
  const monthKey = format(selectedMonth, 'yyyy-MM');
  const queryClient = useQueryClient();
  
  console.log("useBudgetData: initializing for month", monthKey, "user:", user?.id);
  
  // Initialize optimized data sync
  const { syncInProgress } = useOptimizedDataSync();
  
  // Initialize Finny data sync for real-time updates
  useFinnyDataSync();
  
  // Remove excessive event handling - now handled by useOptimizedDataSync
  
  // Use the separated query hook
  const queryResults = useBudgetQueries(selectedMonth);
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
    isLoading: isLoading || syncInProgress, // Include sync progress in loading state
    exportBudgetData: handleExportBudgetData,
    budgetNotificationData,
    ...calculatedValues
  };
  
  console.log("useBudgetData: returning result", result);
  return result;
}
