import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BalanceOverview } from "@/components/dashboard/BalanceOverview";
import { Card, CardContent } from "@/components/ui/card";
import { ExpensesChart } from "@/components/dashboard/ExpensesChart";
import { RecentExpenses } from "@/components/dashboard/RecentExpenses";
import { Expense } from "@/components/expenses/types";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { AddExpenseSheet } from "@/components/AddExpenseSheet";
import { FinnyCard } from "@/components/dashboard/FinnyCard";
import { WalletBalanceCard } from "@/components/dashboard/wallet/WalletBalanceCard";

interface DashboardContentProps {
  isNewUser: boolean;
  isLoading: boolean;
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  savingsRate: number;
  formatPercentage: (value: number) => string;
  expenses: Expense[];
  isExpensesLoading: boolean;
  expenseToEdit?: Expense;
  setExpenseToEdit: React.Dispatch<React.SetStateAction<Expense | undefined>>;
  showAddExpense: boolean;
  setShowAddExpense: React.Dispatch<React.SetStateAction<boolean>>;
  handleExpenseRefresh: () => void;
  chartType: "bar" | "line";
  setChartType: (type: "bar" | "line") => void;
  setMonthlyIncome: (income: number) => void;
  walletBalance: number;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  isNewUser,
  isLoading,
  totalBalance,
  monthlyExpenses,
  monthlyIncome,
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
  walletBalance,
  setMonthlyIncome
}) => {
  const [showBalanceCard, setShowBalanceCard] = useState(true);

  return (
    <div className="flex flex-col space-y-6">
      <DashboardHeader 
        isNewUser={isNewUser} 
        monthlyExpenses={monthlyExpenses}
        monthlyIncome={monthlyIncome}
        savingsRate={savingsRate}
      />
      
      <BalanceOverview
        totalBalance={totalBalance}
        monthlyExpenses={monthlyExpenses}
        monthlyIncome={monthlyIncome}
        setMonthlyIncome={setMonthlyIncome}
        savingsRate={savingsRate}
        formatPercentage={formatPercentage}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {showBalanceCard && (
          <WalletBalanceCard walletBalance={walletBalance} />
        )}

        <Card className="md:col-span-2 bg-card/95 backdrop-blur-md border-border/30 shadow-sm">
          <CardContent className="p-4">
            <ExpensesChart
              expenses={expenses}
              isLoading={isExpensesLoading}
              chartType={chartType}
              setChartType={setChartType}
            />
          </CardContent>
        </Card>

        <FinnyCard />
      </div>

      <RecentExpenses
        expenses={expenses}
        isLoading={isExpensesLoading}
        expenseToEdit={expenseToEdit}
        setExpenseToEdit={setExpenseToEdit}
        setShowAddExpense={setShowAddExpense}
        handleExpenseRefresh={handleExpenseRefresh}
      />
    </div>
  );
};
