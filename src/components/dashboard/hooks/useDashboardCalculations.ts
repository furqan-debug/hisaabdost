
import { useEffect, useState } from "react";
import { useMonthContext } from "@/hooks/use-month-context";
import { useWalletAdditions } from "@/hooks/useWalletAdditions";

interface DashboardCalculationsProps {
  incomeData: { monthlyIncome: number } | undefined;
  isIncomeLoading: boolean;
  expenses: any[];
  currentMonthKey: string;
}

export function useDashboardCalculations({
  incomeData,
  isIncomeLoading,
  expenses,
  currentMonthKey
}: DashboardCalculationsProps) {
  const monthContext = useMonthContext();
  const { totalAdditions } = useWalletAdditions();
  
  // Get current month's data from context
  const getCurrentMonthData = monthContext?.getCurrentMonthData;
  const updateMonthData = monthContext?.updateMonthData;
  const currentMonthData = getCurrentMonthData ? getCurrentMonthData() : { monthlyIncome: 0 };
  
  const [monthlyIncome, setMonthlyIncome] = useState<number>(currentMonthData?.monthlyIncome || 0);
  
  // Update local income state when data is fetched from Supabase
  useEffect(() => {
    if (incomeData && !isIncomeLoading && updateMonthData && currentMonthKey) {
      console.log("Updating local income state with:", incomeData.monthlyIncome);
      setMonthlyIncome(incomeData.monthlyIncome);
      
      // Also update the month context
      updateMonthData(currentMonthKey, {
        monthlyIncome: incomeData.monthlyIncome
      });
    }
  }, [incomeData, isIncomeLoading, updateMonthData, currentMonthKey]);
  
  // Calculate financial metrics for the current month
  const monthlyExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalBalance = monthlyIncome - monthlyExpenses;
  const walletBalance = monthlyIncome + (totalAdditions || 0) - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  // Update month data when income or expenses change - only when updateMonthData is available
  useEffect(() => {
    if (updateMonthData && currentMonthKey) {
      updateMonthData(currentMonthKey, {
        monthlyIncome: monthlyIncome || 0,
        monthlyExpenses: monthlyExpenses || 0,
        totalBalance: totalBalance || 0,
        walletBalance: walletBalance || 0,
        savingsRate: savingsRate || 0
      });
    }
  }, [
    updateMonthData,
    currentMonthKey,
    monthlyIncome,
    monthlyExpenses,
    totalAdditions,
    totalBalance,
    walletBalance,
    savingsRate
  ]);

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };

  return {
    monthlyIncome,
    setMonthlyIncome,
    monthlyExpenses,
    totalBalance,
    walletBalance,
    totalAdditions: totalAdditions || 0,
    savingsRate,
    formatPercentage
  };
}
