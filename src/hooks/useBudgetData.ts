
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/pages/Budget";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { useState, useEffect, useRef, useCallback } from "react";

export function useBudgetData() {
  const { selectedMonth, getCurrentMonthData, isLoading: isMonthDataLoading, updateMonthData } = useMonthContext();
  const currentMonthData = getCurrentMonthData();
  const monthKey = format(selectedMonth, 'yyyy-MM');
  
  // Selected month ref to prevent excessive recalculations
  const selectedMonthRef = useRef(selectedMonth);
  
  // Refs to store previous values to prevent unnecessary updates
  const prevValuesRef = useRef({
    totalBudget: 0,
    totalSpent: 0,
    remainingBalance: 0,
    usagePercentage: 0
  });

  // Local state to prevent glitching during calculation
  const [stableValues, setStableValues] = useState({
    totalBudget: currentMonthData.totalBudget || 0,
    totalSpent: currentMonthData.monthlyExpenses || 0,
    remainingBalance: currentMonthData.remainingBudget || 0,
    usagePercentage: currentMonthData.budgetUsagePercentage || 0,
    monthlyIncome: currentMonthData.monthlyIncome || 0
  });

  // Update debounce timer ref
  const updateTimerRef = useRef<number | null>(null);
  
  // Update isUpdating flag ref
  const isUpdatingRef = useRef(false);
  
  // Memoize query function
  const fetchBudgets = useCallback(async () => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Budget[];
  }, []);
  
  const fetchExpenses = useCallback(async () => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('date', monthStart.toISOString().split('T')[0])
      .lte('date', monthEnd.toISOString().split('T')[0]);

    if (error) throw error;
    return data;
  }, [selectedMonth]);
  
  // Optimized queries with stale time and caching
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', monthKey],
    queryFn: fetchBudgets,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', monthKey],
    queryFn: fetchExpenses,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Define isLoading variable before it's used
  const isLoading = budgetsLoading || expensesLoading || isMonthDataLoading;

  const exportBudgetData = useCallback(() => {
    if (!budgets) return;

    const csvContent = [
      ['Category', 'Amount', 'Period', 'Carry Forward', 'Created At'].join(','),
      ...budgets.map(budget => [
        budget.category,
        budget.amount,
        budget.period,
        budget.carry_forward,
        format(new Date(budget.created_at), 'yyyy-MM-dd')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `budget_data_${format(selectedMonth, 'yyyy-MM')}.csv`;
    link.click();
  }, [budgets, selectedMonth]);

  // Calculate and debounce summary data updates
  useEffect(() => {
    if (isLoading || !budgets || !expenses || isUpdatingRef.current) return;
    
    // Update selected month ref
    selectedMonthRef.current = selectedMonth;
    
    // Set updating flag
    isUpdatingRef.current = true;
    
    // Calculate new values
    const totalBudget = budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0;
    const totalSpent = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
    const remainingBalance = totalBudget - totalSpent;
    const usagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const monthlyIncome = currentMonthData.monthlyIncome || 0;
    
    // Check if values have meaningfully changed (prevent tiny floating point differences)
    const hasChanged = 
      Math.abs(totalBudget - prevValuesRef.current.totalBudget) > 0.01 ||
      Math.abs(totalSpent - prevValuesRef.current.totalSpent) > 0.01 ||
      Math.abs(remainingBalance - prevValuesRef.current.remainingBalance) > 0.01 ||
      Math.abs(usagePercentage - prevValuesRef.current.usagePercentage) > 0.01;
    
    if (!hasChanged) {
      isUpdatingRef.current = false;
      return;
    }
    
    // Store new values in ref
    prevValuesRef.current = {
      totalBudget,
      totalSpent,
      remainingBalance,
      usagePercentage
    };
    
    // Clear any existing timeout
    if (updateTimerRef.current) {
      window.clearTimeout(updateTimerRef.current);
    }
    
    // Debounce the state update (wait 500ms before applying)
    updateTimerRef.current = window.setTimeout(() => {
      setStableValues({
        totalBudget,
        totalSpent,
        remainingBalance,
        usagePercentage,
        monthlyIncome
      });
      
      // Update monthly context with stable values - but only if the month hasn't changed
      if (format(selectedMonth, 'yyyy-MM') === monthKey) {
        updateMonthData(monthKey, {
          totalBudget,
          remainingBudget: remainingBalance,
          budgetUsagePercentage: usagePercentage,
        });
      }
      
      updateTimerRef.current = null;
      isUpdatingRef.current = false;
    }, 500);
    
    // Cleanup timeout on unmount
    return () => {
      if (updateTimerRef.current) {
        window.clearTimeout(updateTimerRef.current);
      }
    };
  }, [
    budgets, 
    expenses, 
    currentMonthData, 
    monthKey, 
    updateMonthData, 
    isLoading,
    selectedMonth
  ]);

  return {
    budgets,
    expenses,
    isLoading,
    exportBudgetData,
    ...stableValues
  };
}
