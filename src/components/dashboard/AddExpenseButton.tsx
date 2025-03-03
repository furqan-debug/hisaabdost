
import React from "react";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import AddExpenseSheet, { Expense } from "@/components/AddExpenseSheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  return (
    <div className="mt-6">
      <OnboardingTooltip
        content="Click here to add your first expense"
        defaultOpen={isNewUser}
      >
        {isMobile ? (
          <div className="floating-action-button" onClick={() => setShowAddExpense(true)}>
            <Plus className="h-6 w-6" />
          </div>
        ) : (
          <Button 
            onClick={() => setShowAddExpense(true)}
            className="w-full"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Expense
          </Button>
        )}
      </OnboardingTooltip>
      
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
    </div>
  );
};
