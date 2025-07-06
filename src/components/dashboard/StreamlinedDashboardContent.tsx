
import React from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CompactFinancialSummary } from "@/components/dashboard/summary/CompactFinancialSummary";
import { CompactFinnyCard } from "@/components/dashboard/finny/CompactFinnyCard";
import { RecentExpensesCard } from "@/components/dashboard/RecentExpensesCard";
import { SpendingTrendsWidget } from "@/components/dashboard/widgets/SpendingTrendsWidget";
import { FloatingActionButton } from "@/components/dashboard/actions/FloatingActionButton";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { ReceiptFileInput } from "@/components/expenses/form-fields/receipt/ReceiptFileInput";
import { useExpenseFile } from "@/hooks/use-expense-file";
import { useState } from "react";
import { motion } from "framer-motion";

interface StreamlinedDashboardContentProps {
  isNewUser: boolean;
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  savingsRate: number;
  expenses: any[];
  allExpenses: any[];
  isExpensesLoading: boolean;
  expenseToEdit?: any;
  setExpenseToEdit: (expense?: any) => void;
  showAddExpense: boolean;
  setShowAddExpense: (show: boolean) => void;
  walletBalance: number;
}

export const StreamlinedDashboardContent = ({
  isNewUser,
  totalBalance,
  monthlyExpenses,
  monthlyIncome,
  savingsRate,
  expenses,
  allExpenses,
  isExpensesLoading,
  expenseToEdit,
  setExpenseToEdit,
  showAddExpense,
  setShowAddExpense,
  walletBalance
}: StreamlinedDashboardContentProps) => {
  const [captureMode, setCaptureMode] = useState<'manual' | 'upload' | 'camera'>('manual');

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
    setCaptureMode('manual');
    setShowAddExpense(true);
  };

  const handleUploadReceipt = () => {
    setCaptureMode('upload');
    triggerFileUpload();
  };

  const handleTakePhoto = () => {
    setCaptureMode('camera');
    triggerCameraCapture();
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

  const handleExpenseAdded = () => {
    console.log('Dashboard: Expense added - React Query will handle refresh automatically');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header - More compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DashboardHeader isNewUser={isNewUser} />
      </motion.div>
      
      {/* Financial Summary - Grouped into one card */}
      <CompactFinancialSummary
        walletBalance={walletBalance}
        monthlyExpenses={monthlyExpenses}
        monthlyIncome={monthlyIncome}
        savingsRate={savingsRate}
      />

      {/* Compact AI Assistant */}
      <CompactFinnyCard />
      
      {/* Main Content - Single Column with spacing */}
      <div className="space-y-6">
        {/* Recent Expenses - More prominent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <RecentExpensesCard 
            expenses={expenses}
            isNewUser={isNewUser}
            isLoading={isExpensesLoading}
            setShowAddExpense={setShowAddExpense}
          />
        </motion.div>
        
        {/* Spending Trends - Compact version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <SpendingTrendsWidget expenses={allExpenses} />
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onAddExpense={handleAddExpense}
        onUploadReceipt={handleUploadReceipt}
        onTakePhoto={handleTakePhoto}
      />

      {/* Hidden file inputs */}
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

      {/* Expense Sheet */}
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
