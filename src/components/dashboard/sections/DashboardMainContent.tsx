
import React from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FinnyCard } from "@/components/dashboard/FinnyCard";
import { QuickActionsWidget } from "@/components/dashboard/widgets/QuickActionsWidget";
import { SpendingTrendsWidget } from "@/components/dashboard/widgets/SpendingTrendsWidget";
import { RecentExpensesCard } from "@/components/dashboard/RecentExpensesCard";
import { EnhancedStatCards } from "./EnhancedStatCards";
import { AnimatedBackground } from "./AnimatedBackground";
import { FloatingActionButton } from "./FloatingActionButton";

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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <AnimatedBackground />
      
      <motion.div
        className="space-y-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header with enhanced animations */}
        <motion.div variants={itemVariants}>
          <DashboardHeader isNewUser={isNewUser} />
        </motion.div>
        
        {/* Enhanced Stats Cards */}
        <motion.div variants={itemVariants}>
          <EnhancedStatCards
            totalBalance={totalBalance}
            monthlyExpenses={monthlyExpenses}
            monthlyIncome={monthlyIncome}
            savingsRate={savingsRate}
            walletBalance={walletBalance}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Talk to Finny - Enhanced */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <FinnyCard />
            </motion.div>
            
            {/* Quick Actions - Enhanced */}
            <motion.div variants={itemVariants}>
              <QuickActionsWidget
                onAddExpense={onAddExpense}
                onUploadReceipt={onUploadReceipt}
                onTakePhoto={onTakePhoto}
                onAddBudget={onAddBudget}
              />
            </motion.div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Spending Trends */}
            <motion.div variants={itemVariants}>
              <SpendingTrendsWidget expenses={allExpenses} />
            </motion.div>
            
            {/* Recent Expenses */}
            <motion.div variants={itemVariants}>
              <RecentExpensesCard 
                expenses={expenses}
                isNewUser={isNewUser}
                isLoading={isExpensesLoading}
                setShowAddExpense={setShowAddExpense}
              />
            </motion.div>
          </div>
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton onAddExpense={onAddExpense} />
      </motion.div>
    </>
  );
};
