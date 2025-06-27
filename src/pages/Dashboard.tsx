
import React from "react";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { EnhancedDashboardContent } from "@/components/dashboard/EnhancedDashboardContent";
import { useMonthContext } from "@/hooks/use-month-context";
import { useMobileNotificationTriggers } from "@/hooks/useMobileNotificationTriggers";
import { useMonthCarryover } from "@/hooks/useMonthCarryover";
import { useAnalyticsNotifications } from "@/hooks/useAnalyticsNotifications";
import { useMobilePushNotifications } from "@/hooks/useMobilePushNotifications";

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

  // Initialize mobile push notifications
  useMobilePushNotifications();

  // Only setup notifications when we have complete data and user is not new
  const shouldSetupNotifications = !isNewUser && !isLoading && !isExpensesLoading && expenses.length > 0;

  // Setup mobile notification triggers for dashboard - only for established users
  useMobileNotificationTriggers({
    monthlyExpenses: shouldSetupNotifications ? monthlyExpenses : 0,
    monthlyIncome: shouldSetupNotifications ? monthlyIncome : 0,
    walletBalance: shouldSetupNotifications ? walletBalance : 0,
    expenses: shouldSetupNotifications ? expenses : [],
    previousMonthExpenses: 0, // Would need to fetch from previous month
  });

  // Setup month carryover logic
  useMonthCarryover();

  // Setup analytics notifications - only for established users with sufficient data
  useAnalyticsNotifications({ 
    expenses: shouldSetupNotifications && expenses.length >= 20 ? expenses : [] 
  });

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
