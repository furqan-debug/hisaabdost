
import React from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCards } from "@/components/dashboard/StatCards";
import { AddExpenseButton } from "@/components/dashboard/AddExpenseButton";
import { RecentExpensesCard } from "@/components/dashboard/RecentExpensesCard";
import { ExpenseAnalyticsCard } from "@/components/dashboard/ExpenseAnalyticsCard";
import { FinnyCard } from "@/components/dashboard/FinnyCard";

interface DashboardContentProps {
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

export function DashboardContent({
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
}: DashboardContentProps) {
  // Simplified animations for better performance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className="space-y-5 py-2"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <DashboardHeader isNewUser={isNewUser} />
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
        <ExpenseAnalyticsCard 
          expenses={expenses}
          isLoading={isExpensesLoading}
          chartType={chartType}
          setChartType={setChartType}
        />
      </motion.div>
    </motion.div>
  );
}
