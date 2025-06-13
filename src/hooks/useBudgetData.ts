
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/pages/Budget";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { exportExpensesToCSV } from "@/utils/exportUtils";

export function useBudgetData() {
  const { selectedMonth, getCurrentMonthData, isLoading: isMonthDataLoading, updateMonthData } = useMonthContext();
  const { user } = useAuth();
  const currentMonthData = getCurrentMonthData();
  const monthKey = format(selectedMonth, 'yyyy-MM');
  const queryClient = useQueryClient();
  
  // Add refresh trigger state
  const [refreshTrigger, setRefreshTrigger] = useState<number>(Date.now());
  
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
  
  // Listen for budget update events
  useEffect(() => {
    // Handler function for budget events
    const handleBudgetUpdate = (e: Event) => {
      console.log("Budget update detected, refreshing data", e);
      // Force refetch by invalidating the query and updating refresh trigger
      queryClient.invalidateQueries({ queryKey: ['budgets', monthKey, user?.id] });
      setRefreshTrigger(Date.now());
    };
    
    // Add event listeners
    window.addEventListener('budget-updated', handleBudgetUpdate);
    window.addEventListener('budget-deleted', handleBudgetUpdate);
    window.addEventListener('budget-refresh', handleBudgetUpdate);
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('budget-updated', handleBudgetUpdate);
      window.removeEventListener('budget-deleted', handleBudgetUpdate);
      window.removeEventListener('budget-refresh', handleBudgetUpdate);
    };
  }, [queryClient, monthKey, user?.id]);
  
  // Query budgets with the monthly income
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', monthKey, user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching budgets for user:", user.id);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching budgets:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} budgets:`, data);
      return data as Budget[];
    },
    enabled: !!user,
    // Adding staleTime to prevent frequent refetches
    staleTime: 1000, // 1 second
  });
  
  // Query to get monthly income specifically
  const { data: incomeData, isLoading: incomeLoading } = useQuery({
    queryKey: ['monthly_income', user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return { monthlyIncome: 0 };
      
      const { data, error } = await supabase
        .from('budgets')
        .select('monthly_income')
        .eq('user_id', user.id)
        .limit(1);
        
      if (error) throw error;
      return { monthlyIncome: data?.[0]?.monthly_income || 0 };
    },
    enabled: !!user,
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', monthKey, user?.id, refreshTrigger],
    queryFn: async () => {
      if (!user) return [];
      
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0]);

      if (error) throw error;
      console.log(`Fetched ${data?.length || 0} expenses for ${monthKey}`);
      return data;
    },
    enabled: !!user,
  });

  // Define isLoading variable before it's used
  const isLoading = budgetsLoading || expensesLoading || isMonthDataLoading || incomeLoading;

  const exportBudgetData = async () => {
    if (!budgets) return;

    console.log('Starting budget export for mobile...');
    
    // Convert budget data to expense-like format for the mobile-optimized export function
    const budgetExpenses = budgets.map(budget => ({
      id: budget.id,
      date: budget.created_at,
      description: `Budget: ${budget.category}`,
      category: budget.category,
      amount: Number(budget.amount),
      payment: budget.period,
      notes: `Period: ${budget.period}, Carry Forward: ${budget.carry_forward}`,
      user_id: budget.user_id,
      created_at: budget.created_at,
      is_recurring: false,
      receipt_url: ''
    }));

    // Use the mobile-optimized CSV export function
    await exportExpensesToCSV(budgetExpenses);
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

  // Calculate and debounce summary data updates
  useEffect(() => {
    if (isLoading || !budgets || !expenses || !incomeData) return;
    
    // Get monthly income from Supabase data
    const monthlyIncome = incomeData.monthlyIncome || 0;
    
    // Calculate new values
    const totalBudget = budgets?.reduce((sum, budget) => sum + Number(budget.amount), 0) || 0;
    const totalSpent = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
    const remainingBalance = totalBudget - totalSpent;
    const usagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Check if values have meaningfully changed (prevent tiny floating point differences)
    const hasChanged = 
      Math.abs(totalBudget - prevValuesRef.current.totalBudget) > 0.01 ||
      Math.abs(totalSpent - prevValuesRef.current.totalSpent) > 0.01 ||
      Math.abs(remainingBalance - prevValuesRef.current.remainingBalance) > 0.01 ||
      Math.abs(usagePercentage - prevValuesRef.current.usagePercentage) > 0.01;
    
    if (!hasChanged && monthlyIncome === stableValues.monthlyIncome) return;
    
    console.log('Budget data changed, updating values:', {
      totalBudget,
      totalSpent,
      remainingBalance,
      usagePercentage,
      monthlyIncome
    });
    
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
    
    // Debounce the state update (wait 200ms before applying)
    updateTimerRef.current = window.setTimeout(() => {
      setStableValues({
        totalBudget,
        totalSpent,
        remainingBalance,
        usagePercentage,
        monthlyIncome
      });
      
      // Update monthly context with stable values
      updateMonthData(monthKey, {
        totalBudget,
        remainingBudget: remainingBalance,
        budgetUsagePercentage: usagePercentage,
        monthlyIncome,
      });
    }, 200);
    
    // Cleanup timeout on unmount
    return () => {
      if (updateTimerRef.current) {
        window.clearTimeout(updateTimerRef.current);
      }
    };
  }, [budgets, expenses, incomeData, currentMonthData, monthKey, updateMonthData, isLoading, stableValues.monthlyIncome]);

  return {
    budgets,
    expenses,
    isLoading,
    exportBudgetData,
    budgetNotificationData,
    ...stableValues
  };
}
