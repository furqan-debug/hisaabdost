
import React, { useEffect } from "react";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useMonthContext } from "@/hooks/use-month-context";
import { useAnalyticsInsights } from "@/hooks/useAnalyticsInsights";
import "@/styles/mobile-charts.css";
import "@/styles/mobile-cards.css";
import "@/styles/mobile-utils.css";

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
  
  // Prevent horizontal scroll
  useEffect(() => {
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    
    return () => {
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
    };
  }, []);

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
