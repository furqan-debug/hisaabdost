
import React from "react";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { EnhancedDashboardContent } from "@/components/dashboard/EnhancedDashboardContent";
import { useMonthContext } from "@/hooks/use-month-context";
import { useNotificationTriggers } from "@/hooks/useNotificationTriggers";
import { useMonthCarryover } from "@/hooks/useMonthCarryover";
import { useAnalyticsNotifications } from "@/hooks/useAnalyticsNotifications";

/**
 * Dashboard page component that displays financial overview
 * and expense analytics with enhanced widgets and features.
 */
const Dashboard = () => {
  const { isLoading: isMonthDataLoading } = useMonthContext();
  const {
    expenses,
    allExpenses,
    isExpensesLoading,
    isLoading,
    isNewUser,
    monthlyIncome,
    monthlyExpenses,
    totalBalance,
    walletBalance,
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

  // Setup notification triggers for dashboard
  useNotificationTriggers({
    monthlyExpenses,
    monthlyIncome,
    walletBalance,
    expenses,
    previousMonthExpenses: 0, // Would need to fetch from previous month
  });

  // Setup month carryover logic
  useMonthCarryover();

  // Setup analytics notifications - this will send insights as notifications
  useAnalyticsNotifications({ expenses });

  // Show skeleton while loading
  if (isLoading || isMonthDataLoading) {
    return <DashboardSkeleton />;
  }

  // Render enhanced dashboard content
  return (
    <EnhancedDashboardContent 
      isNewUser={isNewUser}
      isLoading={isLoading}
      totalBalance={totalBalance}
      monthlyExpenses={monthlyExpenses}
      monthlyIncome={monthlyIncome}
      setMonthlyIncome={setMonthlyIncome}
      savingsRate={savingsRate}
      formatPercentage={formatPercentage}
      expenses={expenses}
      allExpenses={allExpenses}
      isExpensesLoading={isExpensesLoading}
      expenseToEdit={expenseToEdit}
      setExpenseToEdit={setExpenseToEdit}
      showAddExpense={showAddExpense}
      setShowAddExpense={setShowAddExpense}
      handleExpenseRefresh={handleExpenseRefresh}
      chartType={chartType}
      setChartType={setChartType}
      walletBalance={walletBalance}
    />
  );
};

export default Dashboard;
