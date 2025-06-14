
import { useEffect, useState, useRef } from "react";
import { useMonthContext } from "@/hooks/use-month-context";
import { format } from "date-fns";

interface BudgetCalculationValues {
  totalBudget: number;
  totalSpent: number;
  remainingBalance: number;
  usagePercentage: number;
  monthlyIncome: number;
}

export function useBudgetCalculations(
  budgets: any[] | undefined,
  expenses: any[] | undefined,
  incomeData: any,
  isLoading: boolean,
  selectedMonth: Date
) {
  const { getCurrentMonthData, updateMonthData } = useMonthContext();
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
  const [stableValues, setStableValues] = useState<BudgetCalculationValues>({
    totalBudget: currentMonthData.totalBudget || 0,
    totalSpent: currentMonthData.monthlyExpenses || 0,
    remainingBalance: currentMonthData.remainingBudget || 0,
    usagePercentage: currentMonthData.budgetUsagePercentage || 0,
    monthlyIncome: currentMonthData.monthlyIncome || 0
  });

  // Update debounce timer ref
  const updateTimerRef = useRef<number | null>(null);

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
    
    // Check if values have meaningfully changed
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
    
    // Debounce the state update
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

  return stableValues;
}
