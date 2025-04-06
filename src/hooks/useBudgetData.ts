
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/pages/Budget";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";

export function useBudgetData() {
  const { selectedMonth, getCurrentMonthData, isLoading: isMonthDataLoading, updateMonthData } = useMonthContext();
  const { user } = useAuth();
  const currentMonthData = getCurrentMonthData();
  const monthKey = format(selectedMonth, 'yyyy-MM');
  
  // Define month boundaries for filtering
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const formattedMonthStart = format(monthStart, 'yyyy-MM-dd');
  const formattedMonthEnd = format(monthEnd, 'yyyy-MM-dd');
  
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
  
  // Query budgets with the monthly income
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', monthKey, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log(`Fetching budgets for month: ${format(selectedMonth, 'MMMM yyyy')}`);
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`Fetched ${data?.length || 0} budgets for ${format(selectedMonth, 'MMMM yyyy')}`);
      return data as Budget[];
    },
    enabled: !!user,
  });
  
  // Query to get monthly income specifically
  const { data: incomeData, isLoading: incomeLoading } = useQuery({
    queryKey: ['monthly_income', user?.id, monthKey],
    queryFn: async () => {
      if (!user) return { monthlyIncome: 0 };
      
      console.log(`Fetching monthly income for: ${format(selectedMonth, 'MMMM yyyy')}`);
      
      const { data, error } = await supabase
        .from('budgets')
        .select('monthly_income')
        .eq('user_id', user.id)
        .limit(1);
        
      if (error) throw error;
      
      const monthlyIncome = data?.[0]?.monthly_income || 0;
      console.log(`Fetched monthly income: ${monthlyIncome} for ${format(selectedMonth, 'MMMM yyyy')}`);
      
      return { monthlyIncome };
    },
    enabled: !!user,
  });

  // Query expenses filtered by the selected month
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', monthKey, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log(`Fetching expenses for budget calculations: ${format(selectedMonth, 'MMMM yyyy')}`);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', formattedMonthStart)
        .lte('date', formattedMonthEnd);

      if (error) throw error;
      
      console.log(`Fetched ${data?.length || 0} expenses for budget calculations: ${format(selectedMonth, 'MMMM yyyy')}`);
      return data;
    },
    enabled: !!user,
  });

  // Define isLoading variable before it's used
  const isLoading = budgetsLoading || expensesLoading || isMonthDataLoading || incomeLoading;

  const exportBudgetData = () => {
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
  };

  // Calculate and debounce summary data updates
  useEffect(() => {
    if (isLoading || !budgets || !expenses || !incomeData) return;
    
    // Get monthly income from Supabase data
    const monthlyIncome = incomeData.monthlyIncome || 0;
    
    // Calculate new values
    const totalBudget = budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0;
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
        monthlyExpenses: totalSpent,
        totalBalance: monthlyIncome - totalSpent,
        savingsRate: monthlyIncome > 0 ? ((monthlyIncome - totalSpent) / monthlyIncome) * 100 : 0
      });
    }, 200);
    
    // Cleanup timeout on unmount
    return () => {
      if (updateTimerRef.current) {
        window.clearTimeout(updateTimerRef.current);
      }
    };
  }, [budgets, expenses, incomeData, currentMonthData, monthKey, updateMonthData, isLoading, stableValues.monthlyIncome, selectedMonth]);

  return {
    budgets,
    expenses,
    isLoading,
    exportBudgetData,
    ...stableValues
  };
}
