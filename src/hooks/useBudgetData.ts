
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
  
  // Refs to store previous values to prevent unnecessary updates
  const prevValuesRef = useRef({
    totalBudget: 0,
    totalSpent: 0,
    remainingBalance: 0,
    usagePercentage: 0
  });

  // Local state to prevent glitching during calculation
  const [stableValues, setStableValues] = useState({
    totalBudget: currentMonthData?.totalBudget || 0,
    totalSpent: currentMonthData?.monthlyExpenses || 0,
    remainingBalance: currentMonthData?.remainingBudget || 0,
    usagePercentage: currentMonthData?.budgetUsagePercentage || 0,
    monthlyIncome: currentMonthData?.monthlyIncome || 0
  });

  // Update debounce timer ref
  const updateTimerRef = useRef<number | null>(null);
  
  // Query budgets with the monthly income
  const { data: budgets, isLoading: budgetsLoading, error: budgetsError } = useQuery({
    queryKey: ['budgets', monthKey, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching budgets:', error);
          return [];
        }
        
        return data as Budget[] || [];
      } catch (err) {
        console.error('Exception in budgets query:', err);
        return [];
      }
    },
    enabled: !!user,
    retry: 2,
  });
  
  // Query to get monthly income specifically
  const { data: incomeData, isLoading: incomeLoading, error: incomeError } = useQuery({
    queryKey: ['monthly_income', user?.id],
    queryFn: async () => {
      if (!user) return { monthlyIncome: 0 };
      
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('monthly_income')
          .eq('user_id', user.id)
          .limit(1);
          
        if (error) {
          console.error('Error fetching monthly income:', error);
          return { monthlyIncome: 0 };
        }
        
        return { monthlyIncome: data?.[0]?.monthly_income || 0 };
      } catch (err) {
        console.error('Exception in monthly income query:', err);
        return { monthlyIncome: 0 };
      }
    },
    enabled: !!user,
    retry: 2,
  });

  const { data: expenses, isLoading: expensesLoading, error: expensesError } = useQuery({
    queryKey: ['expenses', monthKey, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const monthStart = startOfMonth(selectedMonth);
        const monthEnd = endOfMonth(selectedMonth);
        
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', monthStart.toISOString().split('T')[0])
          .lte('date', monthEnd.toISOString().split('T')[0]);

        if (error) {
          console.error('Error fetching expenses:', error);
          return [];
        }
        
        return data || [];
      } catch (err) {
        console.error('Exception in expenses query:', err);
        return [];
      }
    },
    enabled: !!user,
    retry: 2,
  });

  // Define isLoading variable before it's used
  const isLoading = budgetsLoading || expensesLoading || isMonthDataLoading || incomeLoading;
  const hasError = budgetsError || expensesError || incomeError;

  const exportBudgetData = () => {
    if (!budgets || !Array.isArray(budgets) || budgets.length === 0) {
      console.log('No budget data to export');
      return;
    }

    try {
      const csvContent = [
        ['Category', 'Amount', 'Period', 'Carry Forward', 'Created At'].join(','),
        ...budgets.map(budget => [
          budget.category || 'Uncategorized',
          budget.amount || 0,
          budget.period || 'monthly',
          budget.carry_forward || false,
          format(new Date(budget.created_at), 'yyyy-MM-dd')
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `budget_data_${format(selectedMonth, 'yyyy-MM')}.csv`;
      link.click();
    } catch (error) {
      console.error('Error exporting budget data:', error);
    }
  };

  // Calculate and debounce summary data updates
  useEffect(() => {
    if (isLoading || hasError) return;
    
    // Ensure we have valid arrays
    const validBudgets = Array.isArray(budgets) ? budgets : [];
    const validExpenses = Array.isArray(expenses) ? expenses : [];
    
    // Get monthly income from Supabase data with fallback
    const monthlyIncome = incomeData?.monthlyIncome || 0;
    
    // Calculate new values with safety checks
    const totalBudget = validBudgets.reduce((sum, budget) => sum + (Number(budget.amount) || 0), 0);
    const totalSpent = validExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
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
      });
    }, 200);
    
    // Cleanup timeout on unmount
    return () => {
      if (updateTimerRef.current) {
        window.clearTimeout(updateTimerRef.current);
      }
    };
  }, [budgets, expenses, incomeData, monthKey, updateMonthData, isLoading, hasError, stableValues.monthlyIncome]);

  return {
    budgets: Array.isArray(budgets) ? budgets : [],
    expenses: Array.isArray(expenses) ? expenses : [],
    isLoading,
    hasError,
    exportBudgetData,
    ...stableValues
  };
}
