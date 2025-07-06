
import React from "react";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { RecentExpensesCard } from "@/components/dashboard/RecentExpensesCard";
import { SpendingTrendsWidget } from "@/components/dashboard/widgets/SpendingTrendsWidget";
import { CompactFinnyCard } from "@/components/dashboard/finny/CompactFinnyCard";
import { FloatingActionButton } from "@/components/dashboard/actions/FloatingActionButton";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import { ReceiptFileInput } from "@/components/expenses/form-fields/receipt/ReceiptFileInput";
import { useExpenseFile } from "@/hooks/use-expense-file";
import { useState } from "react";
import { motion } from "framer-motion";
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
  const [captureMode, setCaptureMode] = useState<'manual' | 'upload' | 'camera'>('manual');
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
    setMonthlyIncome,
    monthlyExpenses,
    totalBalance,
    walletBalance,
    savingsRate,
    expenseToEdit,
    setExpenseToEdit,
    showAddExpense,
    setShowAddExpense,
  } = useDashboardData();

  const {
    selectedFile,
    setSelectedFile,
    fileInputRef,
    cameraInputRef,
    handleFileChange,
    triggerFileUpload,
    triggerCameraCapture
  } = useExpenseFile();

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

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  // Show skeleton while loading
  if (isLoading || isMonthDataLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DashboardHeader isNewUser={isNewUser} />
      </motion.div>

      {/* Financial Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <StatCards
          totalBalance={totalBalance}
          monthlyExpenses={monthlyExpenses}
          monthlyIncome={monthlyIncome}
          setMonthlyIncome={setMonthlyIncome}
          savingsRate={savingsRate}
          formatPercentage={formatPercentage}
          isNewUser={isNewUser}
          isLoading={isLoading}
          walletBalance={walletBalance}
        />
      </motion.div>

      {/* Compact AI Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <CompactFinnyCard />
      </motion.div>
      
      {/* Main Content */}
      <div className="space-y-6">
        {/* Recent Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <RecentExpensesCard 
            expenses={expenses}
            isNewUser={isNewUser}
            isLoading={isExpensesLoading}
            setShowAddExpense={setShowAddExpense}
          />
        </motion.div>
        
        {/* Spending Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
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

export default Dashboard;
