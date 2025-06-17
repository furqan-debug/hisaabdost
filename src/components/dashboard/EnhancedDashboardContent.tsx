import React from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { RecentExpensesCard } from "@/components/dashboard/RecentExpensesCard";
import { ExpenseAnalyticsCard } from "@/components/dashboard/ExpenseAnalyticsCard";
import { AddExpenseButton } from "@/components/dashboard/AddExpenseButton";
import { EnhancedQuickActionsWidget } from "@/components/dashboard/widgets/EnhancedQuickActionsWidget";
import { QuickActionsWidget } from "@/components/dashboard/widgets/QuickActionsWidget";
import { FinnyCard } from "@/components/dashboard/FinnyCard";
import { SpendingTrendsWidget } from "@/components/dashboard/widgets/SpendingTrendsWidget";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useFinny } from "@/components/finny/context/FinnyContext";

interface EnhancedDashboardContentProps {
  isNewUser: boolean;
  isLoading: boolean;
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  setMonthlyIncome: (income: number) => void;
  savingsRate: number;
  formatPercentage: (value: number) => string;
  expenses: any[];
  allExpenses: any[];
  isExpensesLoading: boolean;
  expenseToEdit?: any;
  setExpenseToEdit: (expense?: any) => void;
  showAddExpense: boolean;
  setShowAddExpense: (show: boolean) => void;
  handleExpenseRefresh: () => void;
  chartType: 'pie' | 'bar' | 'line';
  setChartType: (type: 'pie' | 'bar' | 'line') => void;
  walletBalance: number;
}

export const EnhancedDashboardContent = ({
  isNewUser,
  isLoading,
  totalBalance,
  monthlyExpenses,
  monthlyIncome,
  setMonthlyIncome,
  savingsRate,
  formatPercentage,
  expenses,
  allExpenses,
  isExpensesLoading,
  expenseToEdit,
  setExpenseToEdit,
  showAddExpense,
  setShowAddExpense,
  handleExpenseRefresh,
  chartType,
  setChartType,
  walletBalance
}: EnhancedDashboardContentProps) => {
  const isMobile = useIsMobile();
  const { triggerChat } = useFinny();

  const handleAddExpense = () => {
    console.log('Dashboard: handleAddExpense called');
    setShowAddExpense(true);
  };

  const handleUploadReceipt = () => {
    console.log('Dashboard: handleUploadReceipt called');
    // Trigger file upload by dispatching event
    const event = new CustomEvent('open-expense-form', {
      detail: { mode: 'upload' }
    });
    window.dispatchEvent(event);
  };

  const handleTakePhoto = () => {
    console.log('Dashboard: handleTakePhoto called');
    // Trigger camera capture by dispatching event
    const event = new CustomEvent('open-expense-form', {
      detail: { mode: 'camera' }
    });
    window.dispatchEvent(event);
  };

  const handleAddBudget = () => {
    console.log('Dashboard: handleAddBudget called');
    // Use Finny to help with budget creation
    triggerChat('Help me create a new budget');
  };

  return (
    <div className="space-y-6 pb-6">
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

      {/* Main Content Grid */}
      <div className={cn(
        "grid gap-6",
        isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
      )}>
        
        {/* Left Column - Main Content */}
        <div className={cn(
          "space-y-6",
          isMobile ? "col-span-1" : "col-span-2"
        )}>
          
          {/* Quick Actions Widget for New Users */}
          {isNewUser && (
            <QuickActionsWidget
              onAddExpense={handleAddExpense}
              onUploadReceipt={handleUploadReceipt}
              onTakePhoto={handleTakePhoto}
              onAddBudget={handleAddBudget}
            />
          )}

          {/* Add Expense Button */}
          <AddExpenseButton
            isNewUser={isNewUser}
            expenseToEdit={expenseToEdit}
            showAddExpense={showAddExpense}
            setExpenseToEdit={setExpenseToEdit}
            setShowAddExpense={setShowAddExpense}
            onAddExpense={handleExpenseRefresh}
          />

          {/* Recent Expenses */}
          <RecentExpensesCard 
            expenses={expenses}
            isNewUser={isNewUser}
            isLoading={isExpensesLoading}
            setExpenseToEdit={setExpenseToEdit}
            setShowAddExpense={setShowAddExpense}
          />
          
          {/* Expense Analytics */}
          <ExpenseAnalyticsCard 
            expenses={allExpenses}
            isLoading={isExpensesLoading}
            chartType={chartType}
            setChartType={setChartType}
          />
        </div>

        {/* Right Column - Secondary Content */}
        <div className="space-y-6">
          {/* Enhanced Quick Actions Widget for All Users */}
          <EnhancedQuickActionsWidget
            onAddExpense={handleAddExpense}
            onUploadReceipt={handleUploadReceipt}
            onTakePhoto={handleTakePhoto}
            onAddBudget={handleAddBudget}
          />
          
          {/* Finny Card */}
          <FinnyCard />
          
          {/* Spending Trends Widget */}
          <SpendingTrendsWidget expenses={allExpenses} />
        </div>
      </div>
    </div>
  );
};
