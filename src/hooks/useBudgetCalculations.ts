
import { useEffect, useState } from "react";
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
  
  // Local state for calculated values
  const [calculatedValues, setCalculatedValues] = useState<BudgetCalculationValues>({
    totalBudget: currentMonthData.totalBudget || 0,
    totalSpent: currentMonthData.monthlyExpenses || 0,
    remainingBalance: currentMonthData.remainingBudget || 0,
    usagePercentage: currentMonthData.budgetUsagePercentage || 0,
    monthlyIncome: currentMonthData.monthlyIncome || 0
  });

  // Calculate values when data changes
  useEffect(() => {
    if (isLoading || !budgets || !expenses || !incomeData) return;
    
    // Get monthly income from Supabase data
    const monthlyIncome = incomeData.monthlyIncome || 0;
    
    // Calculate new values
    const totalBudget = budgets?.reduce((sum, budget) => sum + Number(budget.amount), 0) || 0;
    const totalSpent = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
    const remainingBalance = totalBudget - totalSpent;
    const usagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    console.log('Calculating budget values:', {
      totalBudget,
      totalSpent,
      remainingBalance,
      usagePercentage,
      monthlyIncome
    });
    
    const newValues = {
      totalBudget,
      totalSpent,
      remainingBalance,
      usagePercentage,
      monthlyIncome
    };
    
    setCalculatedValues(newValues);
    
    // Update monthly context
    updateMonthData(monthKey, {
      totalBudget,
      remainingBudget: remainingBalance,
      budgetUsagePercentage: usagePercentage,
      monthlyIncome,
    });
  }, [budgets, expenses, incomeData, isLoading, monthKey, updateMonthData]);

  return calculatedValues;
}
