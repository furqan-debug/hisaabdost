
import React from "react";
import { DashboardMainContent } from "@/components/dashboard/sections/DashboardMainContent";
import { DashboardExpenseSheet } from "@/components/dashboard/sections/DashboardExpenseSheet";
import { useDashboardActions } from "@/hooks/dashboard/useDashboardActions";

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
  chartType,
  setChartType,
  walletBalance
}: EnhancedDashboardContentProps) => {
  const {
    captureMode,
    setCaptureMode,
    selectedFile,
    setSelectedFile,
    fileInputRef,
    cameraInputRef,
    handleFileChange,
    handleAddExpense,
    handleUploadReceipt,
    handleTakePhoto,
    handleAddBudget
  } = useDashboardActions();

  const handleExpenseAction = (action: string) => {
    setCaptureMode(action as 'manual' | 'upload' | 'camera');
    setShowAddExpense(true);
  };

  const handleExpenseAdded = () => {
    console.log('Dashboard: Expense added - React Query will handle refresh automatically');
  };

  return (
    <div className="space-y-6 pb-6">
      <DashboardMainContent
        isNewUser={isNewUser}
        totalBalance={totalBalance}
        monthlyExpenses={monthlyExpenses}
        monthlyIncome={monthlyIncome}
        setMonthlyIncome={setMonthlyIncome}
        savingsRate={savingsRate}
        formatPercentage={formatPercentage}
        walletBalance={walletBalance}
        expenses={expenses}
        allExpenses={allExpenses}
        isExpensesLoading={isExpensesLoading}
        setShowAddExpense={setShowAddExpense}
        onAddExpense={handleAddExpense}
        onUploadReceipt={handleUploadReceipt}
        onTakePhoto={handleTakePhoto}
        onAddBudget={handleAddBudget}
      />

      <DashboardExpenseSheet
        showAddExpense={showAddExpense}
        setShowAddExpense={setShowAddExpense}
        expenseToEdit={expenseToEdit}
        setExpenseToEdit={setExpenseToEdit}
        captureMode={captureMode}
        setCaptureMode={setCaptureMode}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        fileInputRef={fileInputRef}
        cameraInputRef={cameraInputRef}
        handleFileChange={handleFileChange}
        onExpenseAdded={handleExpenseAdded}
      />
    </div>
  );
};
