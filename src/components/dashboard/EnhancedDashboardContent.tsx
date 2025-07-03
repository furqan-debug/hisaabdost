
import React from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { RecentExpensesCard } from "@/components/dashboard/RecentExpensesCard";
import { QuickActionsWidget } from "@/components/dashboard/widgets/QuickActionsWidget";
import { FinnyCard } from "@/components/dashboard/FinnyCard";
import { SpendingTrendsWidget } from "@/components/dashboard/widgets/SpendingTrendsWidget";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { ReceiptFileInput } from "@/components/expenses/form-fields/receipt/ReceiptFileInput";
import { useExpenseFile } from "@/hooks/use-expense-file";
import { useState } from "react";

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
  const isMobile = useIsMobile();
  const [captureMode, setCaptureMode] = useState<'manual' | 'upload' | 'camera'>('manual');

  // Use the expense file hook to handle file operations
  const {
    selectedFile,
    setSelectedFile,
    fileInputRef,
    cameraInputRef,
    handleFileChange,
    triggerFileUpload,
    triggerCameraCapture
  } = useExpenseFile();

  const handleAddExpense = () => {
    console.log('Dashboard: handleAddExpense called');
    setCaptureMode('manual');
    setShowAddExpense(true);
  };

  const handleUploadReceipt = () => {
    console.log('Dashboard: handleUploadReceipt called');
    setCaptureMode('upload');
    triggerFileUpload();
  };

  const handleTakePhoto = () => {
    console.log('Dashboard: handleTakePhoto called');
    setCaptureMode('camera');
    triggerCameraCapture();
  };

  const handleAddBudget = () => {
    console.log('Dashboard: handleAddBudget called - navigating to budget page');
    window.location.href = '/app/budget';
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = handleFileChange(e);
    if (file) {
      setSelectedFile(file);
      setShowAddExpense(true);
    }
  };

  const handleSheetClose = () => {
    setShowAddExpense(false);
    setSelectedFile(null);
    setCaptureMode('manual');
    setExpenseToEdit(undefined);
  };

  // Simple expense added handler - no manual refresh needed as React Query handles it automatically
  const handleExpenseAdded = () => {
    console.log('Dashboard: Expense added - React Query will handle refresh automatically');
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

      {/* Main Content - Single Column Layout */}
      <div className="space-y-6">
        {/* 1. Talk to Finny */}
        <FinnyCard />
        
        {/* 2. Quick Actions */}
        <QuickActionsWidget
          onAddExpense={handleAddExpense}
          onUploadReceipt={handleUploadReceipt}
          onTakePhoto={handleTakePhoto}
          onAddBudget={handleAddBudget}
        />
        
        {/* 3. Spending Trends */}
        <SpendingTrendsWidget expenses={allExpenses} />
        
        {/* 4. Recent Expenses */}
        <RecentExpensesCard 
          expenses={expenses}
          isNewUser={isNewUser}
          isLoading={isExpensesLoading}
          setExpenseToEdit={setExpenseToEdit}
          setShowAddExpense={setShowAddExpense}
        />
      </div>

      {/* Hidden file inputs for receipt processing */}
      <ReceiptFileInput 
        onChange={handleFileSelection} 
        inputRef={fileInputRef} 
        id="dashboard-receipt-upload" 
        useCamera={false} 
      />
      
      <ReceiptFileInput 
        onChange={handleFileSelection} 
        inputRef={cameraInputRef} 
        id="dashboard-camera-capture" 
        useCamera={true} 
      />

      {/* Expense Sheet - triggered from Quick Actions */}
      <AddExpenseSheet 
        onAddExpense={handleExpenseAdded} 
        expenseToEdit={expenseToEdit} 
        onClose={handleSheetClose} 
        open={showAddExpense || expenseToEdit !== undefined} 
        onOpenChange={setShowAddExpense} 
        initialCaptureMode={captureMode} 
        initialFile={selectedFile}
      />
    </div>
  );
};
