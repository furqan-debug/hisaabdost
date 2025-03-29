
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useExpenseRefresh } from '@/hooks/useExpenseRefresh';
import { supabase } from '@/integrations/supabase/client';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ExpenseSkeleton } from '@/components/expenses/ExpenseSkeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/utils/formatters';

export function ExpenseList() {
  const { refreshTrigger } = useExpenseRefresh();
  const navigate = useNavigate();
  
  // Fetch expenses with a shorter refetch interval to ensure updates are reflected quickly
  const { data: expenses, isLoading, error, refetch } = useQuery({
    queryKey: ['expenses', refreshTrigger],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 2000, // Refetch every 2 seconds to ensure fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
  
  // Trigger a refetch when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("Triggering expense list refetch due to refresh event");
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const handleAddExpense = () => {
    navigate('/expenses/new');
  };

  // Calculate total expenses for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthExpenses = expenses?.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  }) || [];

  const totalCurrentMonth = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Expenses</h2>
          <Button onClick={handleAddExpense} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
        <div className="space-y-4">
          <ExpenseSkeleton />
          <ExpenseSkeleton />
          <ExpenseSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Expenses</h2>
          <Button onClick={handleAddExpense} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          Error loading expenses. Please try again later.
        </div>
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Expenses</h2>
          <Button onClick={handleAddExpense} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
        <EmptyState
          title="No expenses yet"
          description="Start tracking your spending by adding your first expense."
          action={
            <Button onClick={handleAddExpense}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Recent Expenses</h2>
          <p className="text-sm text-muted-foreground">
            This month: {formatCurrency(totalCurrentMonth)}
          </p>
        </div>
        <Button onClick={handleAddExpense} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>
      <div className="space-y-4">
        {expenses.map((expense) => (
          <ExpenseCard key={expense.id} expense={expense} />
        ))}
      </div>
    </div>
  );
}
