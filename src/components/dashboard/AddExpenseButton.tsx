
import React from "react";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import AddExpenseSheet, { Expense } from "@/components/AddExpenseSheet";

interface AddExpenseButtonProps {
  isNewUser: boolean;
  expenseToEdit?: Expense;
  showAddExpense: boolean;
  setExpenseToEdit: (expense?: Expense) => void;
  setShowAddExpense: (show: boolean) => void;
  onAddExpense: () => void;
}

export const AddExpenseButton = ({
  isNewUser,
  expenseToEdit,
  showAddExpense,
  setExpenseToEdit,
  setShowAddExpense,
  onAddExpense,
}: AddExpenseButtonProps) => {
  return (
    <div className="mt-6">
      <OnboardingTooltip
        content="Click here to add your first expense"
        defaultOpen={isNewUser}
      >
        <AddExpenseSheet 
          onAddExpense={onAddExpense}
          expenseToEdit={expenseToEdit}
          onClose={() => {
            setExpenseToEdit(undefined);
            setShowAddExpense(false);
          }}
          open={showAddExpense || expenseToEdit !== undefined}
          onOpenChange={setShowAddExpense}
        />
      </OnboardingTooltip>
    </div>
  );
};
