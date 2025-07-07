import React from "react";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { EnhancedDashboardContent } from "@/components/dashboard/EnhancedDashboardContent";
import { useMonthContext } from "@/hooks/use-month-context";
import { useNotificationTriggers } from "@/hooks/useNotificationTriggers";
import { useMonthCarryover } from "@/hooks/useMonthCarryover";
import { useAnalyticsNotifications } from "@/hooks/useAnalyticsNotifications";
import { useFinnyDataSync } from "@/hooks/useFinnyDataSync";
import { useAdMob } from "@/hooks/useAdMob";
import { BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';

/**
 * Dashboard page component that displays financial overview
 * and expense analytics with enhanced widgets and features.
 */
const Dashboard = () => {
  const { isLoading: isMonthDataLoading } = useMonthContext();
  
  // Initialize Finny data synchronization
  useFinnyDataSync();

  // Initialize AdMob banner for Dashboard (keeping existing ID)
  useAdMob({
    adId: 'ca-app-pub-8996865130200922/3757228200',
    position: BannerAdPosition.BOTTOM_CENTER,
    size: BannerAdSize.BANNER,
    autoShow: true
  });
  
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
    <div className="pb-24 md:pb-8">
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
  );
};

export default Dashboard;
