
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpenseRefresh } from '@/hooks/useExpenseRefresh';
import { Button } from '@/components/ui/button';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { PlusCircle } from 'lucide-react';
import { ExpenseSkeleton } from '@/components/expenses/ExpenseSkeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/utils/formatters';

export function ExpenseList() {
  const { data: expenses, isLoading, error } = useExpenseRefresh();
  const navigate = useNavigate();

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
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
        <div className="space-y-3">
          <ExpenseSkeleton />
          <ExpenseSkeleton />
          <ExpenseSkeleton />
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
          <p className="text-sm text-muted-foreground">Total: {formatCurrency(totalAmount)}</p>
        </div>
        <Button variant="outline" onClick={handleAddExpense}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>
      <div className="space-y-3">
        {expenses.map((expense) => (
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
