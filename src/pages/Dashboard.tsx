
import React from "react";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { EnhancedDashboardContent } from "@/components/dashboard/EnhancedDashboardContent";
import { useMonthContext } from "@/hooks/use-month-context";
import { useNotificationTriggers } from "@/hooks/useNotificationTriggers";
import { useMonthCarryover } from "@/hooks/useMonthCarryover";
import { useAnalyticsNotifications } from "@/hooks/useAnalyticsNotifications";
import { useFinnyDataSync } from "@/hooks/useFinnyDataSync";
import { BannerAd } from "@/components/ads/BannerAd";
import { useModalState } from "@/hooks/useModalState";

/**
 * Dashboard page component that displays financial overview
 * and expense analytics with enhanced widgets and features.
 */
const Dashboard = () => {
  const { isModalOpen } = useModalState();
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
    chartType,
    setChartType,
    expenseToEdit,
    setExpenseToEdit,
    showAddExpense,
    setShowAddExpense,
    formatPercentage,
    setMonthlyIncome
  } = useDashboardData();

  const shouldSetupNotifications = !isNewUser && !isLoading && !isExpensesLoading && expenses.length > 0;

  useNotificationTriggers({
    monthlyExpenses: shouldSetupNotifications ? monthlyExpenses : 0,
    monthlyIncome: shouldSetupNotifications ? monthlyIncome : 0,
    walletBalance: shouldSetupNotifications ? walletBalance : 0,
    expenses: shouldSetupNotifications ? expenses : [],
    previousMonthExpenses: 0,
  });

  useMonthCarryover();

  useAnalyticsNotifications({ 
    expenses: shouldSetupNotifications && expenses.length >= 20 ? expenses : [] 
  });

  if (isLoading || isMonthDataLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="relative">
      {/* Test Banner Ad - Simple div, no sticky/fixed positioning */}
      <div className="w-full bg-gray-100 border-b">
        <BannerAd 
          adId="ca-app-pub-3940256099942544/6300978111" 
          visible={!isModalOpen} 
        />
      </div>
      
      <div className="space-y-4 pt-4">
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
          chartType={chartType}
          setChartType={setChartType}
          walletBalance={walletBalance}
        />
      </div>
    </div>
  );
};

export default Dashboard;
