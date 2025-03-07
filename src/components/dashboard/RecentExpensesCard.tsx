
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Plus, Pencil, Receipt } from "lucide-react";
import { Expense } from "@/components/AddExpenseSheet";
import { formatCurrency } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface RecentExpensesCardProps {
  expenses: Expense[];
  isNewUser: boolean;
  isLoading: boolean;
  setExpenseToEdit: (expense: Expense) => void;
  setShowAddExpense: (show: boolean) => void;
  selectedMonth?: string;
}

export const RecentExpensesCard: React.FC<RecentExpensesCardProps> = ({
  expenses,
  isNewUser,
  isLoading,
  setExpenseToEdit,
  setShowAddExpense,
  selectedMonth = 'current month'
}) => {
  const isMobile = useIsMobile();
  const displayedExpenses = expenses.slice(0, 5);

  const handleEditClick = (expense: Expense) => {
    setExpenseToEdit(expense);
    setShowAddExpense(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={isMobile ? "text-lg" : ""}>
          Recent Expenses
          {selectedMonth !== 'current month' && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({selectedMonth})
            </span>
          )}
        </CardTitle>
        {!isNewUser && (
          <Button 
            variant="purple" 
            size={isMobile ? "sm" : "default"}
            onClick={() => setShowAddExpense(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <p className="text-muted-foreground">Loading expenses...</p>
          </div>
        ) : isNewUser || expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <p className="text-muted-foreground">No expenses yet</p>
            <Button 
              variant="purple" 
              onClick={() => setShowAddExpense(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add your first expense
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {displayedExpenses.map((expense) => (
              <div 
                key={expense.id} 
                className="flex items-center justify-between py-3"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{expense.description}</span>
                    {expense.receiptUrl && (
                      <Receipt className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                    <span>•</span>
                    <span>{expense.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {formatCurrency(expense.amount)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditClick(expense)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
