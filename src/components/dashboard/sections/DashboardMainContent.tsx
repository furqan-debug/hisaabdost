
import React from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { FinnyCard } from "@/components/dashboard/FinnyCard";
import { QuickActionsWidget } from "@/components/dashboard/widgets/QuickActionsWidget";
import { SpendingTrendsWidget } from "@/components/dashboard/widgets/SpendingTrendsWidget";
import { RecentExpensesCard } from "@/components/dashboard/RecentExpensesCard";

interface DashboardMainContentProps {
  isNewUser: boolean;
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  setMonthlyIncome: (income: number) => void;
  savingsRate: number;
  formatPercentage: (value: number) => string;
  walletBalance: number;
  expenses: any[];
  allExpenses: any[];
  isExpensesLoading: boolean;
  setShowAddExpense: (show: boolean) => void;
  onAddExpense: () => void;
  onUploadReceipt: () => void;
  onTakePhoto: () => void;
  onAddBudget: () => void;
}

export const DashboardMainContent = ({
  isNewUser,
  totalBalance,
  monthlyExpenses,
  monthlyIncome,
  setMonthlyIncome,
  savingsRate,
  formatPercentage,
  walletBalance,
  expenses,
  allExpenses,
  isExpensesLoading,
  setShowAddExpense,
  onAddExpense,
  onUploadReceipt,
  onTakePhoto,
  onAddBudget
}: DashboardMainContentProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader isNewUser={isNewUser} />
      
      {/* Stats Cards */}
      <StatCards 
        totalBalance={totalBalance}
        monthlyExpenses={monthlyExpenses}
        monthlyIncome={monthlyIncome}
        setMonthlyIncome={setMonthlyIncome}
        savingsRate={savingsRate}
        formatPercentage={formatPercentage}
        walletBalance={walletBalance}
        isNewUser={isNewUser}
      />

      {/* Main Content - Single Column Layout */}
      <div className="space-y-6">
        {/* 1. Talk to Finny */}
        <FinnyCard />
        
        {/* 2. Quick Actions */}
        <QuickActionsWidget
          onAddExpense={onAddExpense}
          onUploadReceipt={onUploadReceipt}
          onTakePhoto={onTakePhoto}
          onAddBudget={onAddBudget}
        />
        
        {/* 3. Spending Trends */}
        <SpendingTrendsWidget expenses={allExpenses} />
        
        {/* 4. Recent Expenses */}
        <RecentExpensesCard 
          expenses={expenses}
          isNewUser={isNewUser}
          isLoading={isExpensesLoading}
          setShowAddExpense={setShowAddExpense}
        />
      </div>
    </div>
  );
};
