
import React from "react";
import { Expense } from "@/components/expenses/types";
import { AddExpenseButton } from "@/components/dashboard/AddExpenseButton";
import { RecentExpensesCard } from "@/components/dashboard/RecentExpensesCard";

interface RecentExpensesProps {
  expenses: Expense[];
  isLoading: boolean;
  expenseToEdit?: Expense;
  setExpenseToEdit: React.Dispatch<React.SetStateAction<Expense | undefined>>;
  setShowAddExpense: React.Dispatch<React.SetStateAction<boolean>>;
  handleExpenseRefresh: () => void;
}

export const RecentExpenses: React.FC<RecentExpensesProps> = ({
  expenses,
  isLoading,
  expenseToEdit,
  setExpenseToEdit,
  setShowAddExpense,
  handleExpenseRefresh
}) => {
  const isNewUser = expenses.length === 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <RecentExpensesCard
          expenses={expenses}
          isNewUser={isNewUser}
          isLoading={isLoading}
          setExpenseToEdit={setExpenseToEdit}
          setShowAddExpense={setShowAddExpense}
        />
      </div>
      
      <AddExpenseButton
        isNewUser={isNewUser}
        expenseToEdit={expenseToEdit}
        showAddExpense={false}
        setExpenseToEdit={setExpenseToEdit}
        setShowAddExpense={setShowAddExpense}
        onAddExpense={handleExpenseRefresh}
      />
    </div>
  );
};
