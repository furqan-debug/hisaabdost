
import { useState } from "react";
import { Expense } from "@/components/expenses/types";
import { useDashboardQueries } from "./hooks/useDashboardQueries";
import { useDashboardCalculations } from "./hooks/useDashboardCalculations";
import { useDashboardNotifications } from "./hooks/useDashboardNotifications";

export function useDashboardData() {
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  // Fetch data using the queries hook
  const {
    incomeData,
    isIncomeLoading,
    expenses,
    allExpenses,
    isExpensesLoading,
    handleExpenseRefresh,
    selectedMonth,
    currentMonthKey
  } = useDashboardQueries();
  
  // Calculate financial metrics
  const {
    monthlyIncome,
    setMonthlyIncome,
    monthlyExpenses,
    totalBalance,
    walletBalance,
    totalAdditions,
    savingsRate,
    formatPercentage
  } = useDashboardCalculations({
    incomeData,
    isIncomeLoading,
    expenses,
    currentMonthKey
  });
  
  // Setup notifications
  useDashboardNotifications({
    monthlyExpenses,
    monthlyIncome,
    walletBalance,
    expenses,
    selectedMonth
  });

  const isNewUser = expenses.length === 0;
  const isLoading = isExpensesLoading || isIncomeLoading;

  return {
    expenses,
    allExpenses,
    isExpensesLoading,
    isLoading,
    isNewUser,
    monthlyIncome,
    monthlyExpenses,
    totalBalance,
    walletBalance,
    totalAdditions,
    savingsRate,
    chartType,
    setChartType,
    expenseToEdit,
    setExpenseToEdit,
    showAddExpense,
    setShowAddExpense,
    handleExpenseRefresh,
    formatPercentage,
    setMonthlyIncome
  };
}
