
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Budget } from "@/pages/Budget";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useMonthContext } from "@/hooks/use-month-context";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function useBudgetData() {
  const { user } = useAuth();
  const { selectedMonth, getCurrentMonthData, isLoading: isMonthDataLoading, updateMonthData } = useMonthContext();
  const currentMonthData = getCurrentMonthData();
  const monthKey = format(selectedMonth, 'yyyy-MM');
  const queryClient = useQueryClient();
  
  // Selected month ref to prevent excessive recalculations
  const selectedMonthRef = useRef(selectedMonth);
  
  // Refs to store previous values to prevent unnecessary updates
  const prevValuesRef = useRef({
    totalBudget: 0,
    totalSpent: 0,
    remainingBalance: 0,
    usagePercentage: 0,
    monthlyIncome: 0
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
  
  // Track the most recent month key
  const monthKeyRef = useRef(monthKey);
  
  // Update month key reference when it changes
  useEffect(() => {
    monthKeyRef.current = monthKey;
  }, [monthKey]);
  
  // Memoize query function
  const fetchBudgets = useCallback(async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // If we have data and it includes monthly_income, update the context
      if (data && data.length > 0) {
        // Get the most recent budget with monthly_income set
        const budgetWithIncome = data.find(budget => budget.monthly_income !== null && budget.monthly_income > 0);
        
        if (budgetWithIncome) {
          updateMonthData(monthKeyRef.current, {
            monthlyIncome: budgetWithIncome.monthly_income
          });
        }
      }
      
      return data as Budget[];
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
  }, [user, updateMonthData]);
  
  const fetchExpenses = useCallback(async () => {
    if (!user) return [];
    
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  }, [selectedMonth, user]);
  
  // Optimized queries with stale time and caching
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', monthKey, user?.id],
    queryFn: fetchBudgets,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', monthKey, user?.id],
    queryFn: fetchExpenses,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!user,
  });

  // Define isLoading variable before it's used
  const isLoading = budgetsLoading || expensesLoading || isMonthDataLoading;

  // Update monthly income in Supabase
  const updateMonthlyIncome = async (incomeValue: number) => {
    if (!user) return false;
    
    try {
      // Check if user has any budget entries already
      const { data: existingBudgets, error: fetchError } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
        
      if (fetchError) throw fetchError;
      
      if (existingBudgets && existingBudgets.length > 0) {
        // Update monthly_income on all user's budget entries
        const { error: updateError } = await supabase
          .from('budgets')
          .update({ monthly_income: incomeValue })
          .eq('user_id', user.id);
          
        if (updateError) throw updateError;
      } else {
        // Create a new budget entry with monthly_income
        const { error: insertError } = await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            category: 'Income',
            amount: 0,
            period: 'monthly',
            monthly_income: incomeValue
          });
          
        if (insertError) throw insertError;
      }
      
      // Update local state and context
      updateMonthData(monthKeyRef.current, {
        monthlyIncome: incomeValue
      });
      
      // Invalidate budgets query to refresh data
      queryClient.invalidateQueries({ queryKey: ['budgets', monthKey, user.id] });
      
      toast.success("Monthly income updated in database");
      return true;
    } catch (error) {
      console.error('Error updating monthly income:', error);
      toast.error("Failed to save monthly income to database");
      return false;
    }
  };

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

  // Update the monthly income in stableValues when it changes in context
  useEffect(() => {
    if (isMonthDataLoading) return;
    
    const currentIncome = currentMonthData.monthlyIncome;
    
    // Only update if the income has changed
    if (currentIncome !== stableValues.monthlyIncome) {
      setStableValues(prev => ({
        ...prev,
        monthlyIncome: currentIncome || 0
      }));
      
      prevValuesRef.current.monthlyIncome = currentIncome || 0;
    }
  }, [currentMonthData.monthlyIncome, isMonthDataLoading]);

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
      Math.abs(usagePercentage - prevValuesRef.current.usagePercentage) > 0.01 ||
      Math.abs(monthlyIncome - prevValuesRef.current.monthlyIncome) > 0.01;
    
    if (!hasChanged) {
      isUpdatingRef.current = false;
      return;
    }
    
    // Store new values in ref
    prevValuesRef.current = {
      totalBudget,
      totalSpent,
      remainingBalance,
      usagePercentage,
      monthlyIncome
    };
    
    // Clear any existing timeout
    if (updateTimerRef.current) {
      window.clearTimeout(updateTimerRef.current);
    }
    
    // Debounce the state update (wait 300ms before applying)
    updateTimerRef.current = window.setTimeout(() => {
      setStableValues({
        totalBudget,
        totalSpent,
        remainingBalance,
        usagePercentage,
        monthlyIncome
      });
      
      // Update monthly context with stable values - but only if the month hasn't changed
      // Make sure to preserve the current monthlyIncome when updating other values
      if (format(selectedMonth, 'yyyy-MM') === monthKeyRef.current) {
        updateMonthData(monthKeyRef.current, {
          totalBudget,
          remainingBudget: remainingBalance,
          budgetUsagePercentage: usagePercentage,
          monthlyIncome
        });
      }
      
      updateTimerRef.current = null;
      isUpdatingRef.current = false;
    }, 300);
    
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
    updateMonthlyIncome,
    ...stableValues
  };
}
