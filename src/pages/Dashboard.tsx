
import React from "react";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useMonthContext } from "@/hooks/use-month-context";
import { useAnalyticsInsights } from "@/hooks/useAnalyticsInsights";

/**
 * Dashboard page component that displays financial overview
 * and expense analytics.
 */
const Dashboard = () => {
  const { isLoading: isMonthDataLoading } = useMonthContext();
  const {
    expenses,
    isExpensesLoading,
    isLoading,
    isNewUser,
    monthlyIncome,
    monthlyExpenses,
    totalBalance,
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
  } = useDashboardData();

  // Calculate insights based on expenses
  const insights = useAnalyticsInsights(expenses);

  // Show skeleton while loading
  if (isLoading || isMonthDataLoading) {
    return <DashboardSkeleton />;
  }

  // Render dashboard content
  return (
    <DashboardContent 
      isNewUser={isNewUser}
      isLoading={isLoading}
      totalBalance={totalBalance}
      monthlyExpenses={monthlyExpenses}
      monthlyIncome={monthlyIncome}
      setMonthlyIncome={setMonthlyIncome}
      savingsRate={savingsRate}
      formatPercentage={formatPercentage}
      expenses={expenses}
      isExpensesLoading={isExpensesLoading}
      expenseToEdit={expenseToEdit}
      setExpenseToEdit={setExpenseToEdit}
      showAddExpense={showAddExpense}
      setShowAddExpense={setShowAddExpense}
      handleExpenseRefresh={handleExpenseRefresh}
      chartType={chartType}
      setChartType={setChartType}
    />
  );
};

export default Dashboard;
