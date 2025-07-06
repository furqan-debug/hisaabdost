
import React from "react";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { StreamlinedDashboardContent } from "@/components/dashboard/StreamlinedDashboardContent";
import { useMonthContext } from "@/hooks/use-month-context";
import { useNotificationTriggers } from "@/hooks/useNotificationTriggers";
import { useMonthCarryover } from "@/hooks/useMonthCarryover";
import { useAnalyticsNotifications } from "@/hooks/useAnalyticsNotifications";
import { useFinnyDataSync } from "@/hooks/useFinnyDataSync";

/**
 * Dashboard page component that displays financial overview
 * with a clean, streamlined design focused on user experience.
 */
const Dashboard = () => {
  const { isLoading: isMonthDataLoading } = useMonthContext();
  
  // Initialize Finny data synchronization
  useFinnyDataSync();
  
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
    expenseToEdit,
    setExpenseToEdit,
    showAddExpense,
    setShowAddExpense,
  } = useDashboardData();

  // Only setup notifications when we have complete data and user is not new
  const shouldSetupNotifications = !isNewUser && !isLoading && !isExpensesLoading && expenses.length > 0;

  // Setup notification triggers for dashboard - only for established users
  useNotificationTriggers({
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

  // Render streamlined dashboard content
  return (
    <StreamlinedDashboardContent 
      isNewUser={isNewUser}
      totalBalance={totalBalance}
      monthlyExpenses={monthlyExpenses}
      monthlyIncome={monthlyIncome}
      savingsRate={savingsRate}
      expenses={expenses}
      allExpenses={allExpenses}
      isExpensesLoading={isExpensesLoading}
      expenseToEdit={expenseToEdit}
      setExpenseToEdit={setExpenseToEdit}
      showAddExpense={showAddExpense}
      setShowAddExpense={setShowAddExpense}
      walletBalance={walletBalance}
    />
  );
};

export default Dashboard;
