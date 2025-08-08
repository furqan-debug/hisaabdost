
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
  
  console.log("useBudgetData: initializing for month", monthKey, "user:", user?.id);
  
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

  // Optimized event handling with debounce
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    
    const handleBudgetUpdate = (event: CustomEvent) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      
      debounceTimer = setTimeout(() => {
        console.log("useBudgetData: Budget update event received", event.type);
        
        // Only invalidate specific queries instead of full refresh
        queryClient.invalidateQueries({ queryKey: ['budgets', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['expenses', monthKey, user?.id] });
      }, 300); // 300ms debounce
    };

    const handleExpenseUpdate = (event: CustomEvent) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      
      debounceTimer = setTimeout(() => {
        console.log("useBudgetData: Expense update event received", event.type);
        
        // Only invalidate expense queries
        queryClient.invalidateQueries({ queryKey: ['expenses', monthKey, user?.id] });
      }, 300); // 300ms debounce
    };

    // Listen only to essential events
    const budgetEvents = ['budget-added', 'budget-updated', 'budget-deleted', 'set_budget', 'update_budget'];
    const expenseEvents = ['expense-added', 'expense-updated', 'expense-deleted', 'finny-expense-added'];
    
    budgetEvents.forEach(eventType => {
      window.addEventListener(eventType, handleBudgetUpdate as EventListener);
    });
    
    expenseEvents.forEach(eventType => {
      window.addEventListener(eventType, handleExpenseUpdate as EventListener);
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      
      budgetEvents.forEach(eventType => {
        window.removeEventListener(eventType, handleBudgetUpdate as EventListener);
      });
      
      expenseEvents.forEach(eventType => {
        window.removeEventListener(eventType, handleExpenseUpdate as EventListener);
      });
    };
  }, [queryClient, user?.id, monthKey]);

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
    isLoading: isLoading,
    exportBudgetData: handleExportBudgetData,
    budgetNotificationData,
    ...calculatedValues
  };
  
  console.log("useBudgetData: returning result", result);
  return result;
}
