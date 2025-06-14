
import React, { useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { AddExpenseButton } from "@/components/dashboard/AddExpenseButton";
import { RecentExpensesCard } from "@/components/dashboard/RecentExpensesCard";
import { ExpenseAnalyticsCard } from "@/components/dashboard/ExpenseAnalyticsCard";
import { FinnyCard } from "@/components/dashboard/FinnyCard";
import { QuickActionsWidget } from "./widgets/QuickActionsWidget";
import { SpendingTrendsWidget } from "./widgets/SpendingTrendsWidget";
import { BulkReceiptUpload } from "@/components/receipts/BulkReceiptUpload";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  isExpensesLoading: boolean;
  expenseToEdit: any;
  setExpenseToEdit: (expense: any) => void;
  showAddExpense: boolean;
  setShowAddExpense: (show: boolean) => void;
  handleExpenseRefresh: () => void;
  chartType: 'pie' | 'bar' | 'line';
  setChartType: (type: 'pie' | 'bar' | 'line') => void;
  walletBalance: number;
}

export function EnhancedDashboardContent({
  isNewUser,
  isLoading,
  totalBalance,
  monthlyExpenses,
  monthlyIncome,
  setMonthlyIncome,
  savingsRate,
  formatPercentage,
  expenses,
  isExpensesLoading,
  expenseToEdit,
  setExpenseToEdit,
  showAddExpense,
  setShowAddExpense,
  handleExpenseRefresh,
  chartType,
  setChartType,
  walletBalance
}: EnhancedDashboardContentProps) {
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  // Generate mock spending trends data
  const generateTrendsData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      date: `2024-${String(index + 1).padStart(2, '0')}-01`,
      month,
      amount: Math.random() * 2000 + 500 // Random spending between 500-2500
    }));
  };

  const trendsData = generateTrendsData();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const quickActions = {
    onAddExpense: () => {
      console.log('Add expense clicked');
      setShowAddExpense(true);
    },
    onUploadReceipt: () => {
      console.log('Upload receipt clicked');
      setShowBulkUpload(true);
    },
    onTakePhoto: () => {
      console.log('Take photo clicked');
      setShowAddExpense(true);
    },
    onViewAnalytics: () => {
      console.log('View analytics clicked');
      navigate('/app/expenses');
    },
    onViewTrends: () => {
      console.log('View trends clicked');
      navigate('/app/history');
    },
    onOpenCalculator: () => {
      console.log('Calculator clicked');
      // Simple calculator functionality
      const result = prompt('Enter calculation (e.g., 100+50):');
      if (result) {
        try {
          const calculation = eval(result);
          alert(`Result: ${calculation}`);
        } catch (error) {
          alert('Invalid calculation');
        }
      }
    }
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    console.log('View mode changed to:', mode);
    setViewMode(mode);
  };

  return (
    <>
      <motion.div 
        className="space-y-5 py-2 touch-scroll-container no-scrollbar"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header with View Toggle */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <DashboardHeader isNewUser={isNewUser} />
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
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

        {viewMode === 'grid' ? (
          // Grid Layout
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div variants={itemVariants}>
              <QuickActionsWidget {...quickActions} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FinnyCard />
            </motion.div>

            <motion.div variants={itemVariants}>
              <SpendingTrendsWidget 
                data={trendsData}
                isLoading={isExpensesLoading}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <RecentExpensesCard 
                expenses={expenses}
                isNewUser={isNewUser}
                isLoading={isExpensesLoading}
                setExpenseToEdit={setExpenseToEdit}
                setShowAddExpense={setShowAddExpense}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-2">
              <ExpenseAnalyticsCard 
                expenses={expenses}
                isLoading={isExpensesLoading}
                chartType={chartType}
                setChartType={setChartType}
              />
            </motion.div>
          </div>
        ) : (
          // List Layout
          <div className="space-y-5">
            <motion.div variants={itemVariants}>
              <QuickActionsWidget {...quickActions} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FinnyCard />
            </motion.div>

            <motion.div variants={itemVariants}>
              <AddExpenseButton 
                isNewUser={isNewUser}
                expenseToEdit={expenseToEdit}
                showAddExpense={showAddExpense}
                setExpenseToEdit={setExpenseToEdit}
                setShowAddExpense={setShowAddExpense}
                onAddExpense={handleExpenseRefresh}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <RecentExpensesCard 
                expenses={expenses}
                isNewUser={isNewUser}
                isLoading={isExpensesLoading}
                setExpenseToEdit={setExpenseToEdit}
                setShowAddExpense={setShowAddExpense}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <SpendingTrendsWidget 
                data={trendsData}
                isLoading={isExpensesLoading}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <ExpenseAnalyticsCard 
                expenses={expenses}
                isLoading={isExpensesLoading}
                chartType={chartType}
                setChartType={setChartType}
              />
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <BulkReceiptUpload
            onUploadComplete={() => {
              setShowBulkUpload(false);
              handleExpenseRefresh();
            }}
            onClose={() => setShowBulkUpload(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
