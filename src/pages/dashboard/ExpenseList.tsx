
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/use-currency";
import { useExpenseQueries } from "@/hooks/useExpenseQueries";

export default function ExpenseList() {
  const navigate = useNavigate();
  const { currencyCode } = useCurrency();
  const { expenses, isLoading, error } = useExpenseQueries();

  const handleAddExpense = () => {
    navigate('/expenses/new');
  };

  const handleExpenseClick = (id: string) => {
    navigate(`/expenses/${id}`);
  };

  // Calculate total amount
  const totalAmount = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Expenses</h2>
          <Button variant="outline" onClick={handleAddExpense}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading expenses"
        description="There was a problem loading your expenses. Please try again later."
        action={
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        }
      />
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <EmptyState
        title="No expenses found"
        description="You haven't added any expenses yet. Add your first expense to get started."
        action={
          <Button onClick={handleAddExpense}>Add Expense</Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Recent Expenses</h2>
          <p className="text-sm text-muted-foreground">Total: {formatCurrency(totalAmount, currencyCode)}</p>
        </div>
        <Button variant="outline" onClick={handleAddExpense}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>
      <div className="space-y-3">
        {expenses.slice(0, 10).map((expense) => (
          <ExpenseCard
            key={expense.id}
            description={expense.description}
            amount={expense.amount}
            date={expense.date}
            category={expense.category}
            onClick={() => handleExpenseClick(expense.id)}
          />
        ))}
      </div>
    </div>
  );
}
