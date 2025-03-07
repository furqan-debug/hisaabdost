
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/components/AddExpenseSheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface RecentExpensesCardProps {
  expenses: Expense[];
  isNewUser: boolean;
  isLoading: boolean;
  setExpenseToEdit: (expense: Expense) => void;
  setShowAddExpense: (show: boolean) => void;
  currentMonth?: string;
}

export const RecentExpensesCard = ({
  expenses,
  isNewUser,
  isLoading,
  setExpenseToEdit,
  setShowAddExpense,
  currentMonth,
}: RecentExpensesCardProps) => {
  const isMobile = useIsMobile();
  
  // Format date to show only day and month (e.g., "May 1")
  const formatExpenseDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Format currency with $ and 2 decimal places
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleExpenseClick = (expense: Expense) => {
    setExpenseToEdit(expense);
    setShowAddExpense(true);
  };

  const recentExpenses = expenses.slice(0, 5);

  return (
    <Card>
      <CardHeader className={isMobile ? 'p-4 pb-2' : ''}>
        <CardTitle className={isMobile ? 'text-lg' : ''}>
          Recent Expenses {currentMonth ? `(${currentMonth})` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? 'p-4 pt-0' : ''}>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <p className="text-muted-foreground">Loading expenses...</p>
          </div>
        ) : isNewUser || expenses.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {isNewUser ? "Add your first expense to get started" : "No expenses found for this period"}
          </div>
        ) : (
          <ul className="space-y-2">
            {recentExpenses.map((expense) => (
              <li 
                key={expense.id}
                onClick={() => handleExpenseClick(expense)}
                className="flex justify-between border-b pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-muted/50 p-2 rounded"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getCategoryColor(expense.category)}`}></div>
                  <span>{expense.description}</span>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className={expense.amount > 100 ? 'text-expense-high' : expense.amount > 50 ? 'text-expense-medium' : 'text-expense-low'}>
                    {formatCurrency(expense.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatExpenseDate(expense.date)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to get color based on category
function getCategoryColor(category: string) {
  switch (category.toLowerCase()) {
    case 'food':
      return 'bg-blue-500';
    case 'transportation':
      return 'bg-green-500';
    case 'housing':
      return 'bg-red-500';
    case 'utilities':
      return 'bg-yellow-500';
    case 'entertainment':
      return 'bg-purple-500';
    case 'healthcare':
      return 'bg-pink-500';
    default:
      return 'bg-gray-500';
  }
}
