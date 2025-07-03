
import { QueryClient } from "@tanstack/react-query";
import { Expense } from "@/components/expenses/types";
import { format } from "date-fns";

export interface CacheUpdateOptions {
  queryClient: QueryClient;
  userId: string;
  expense: Expense;
  operation: 'add' | 'update' | 'delete';
}

export function updateExpenseCache({ queryClient, userId, expense, operation }: CacheUpdateOptions) {
  console.log(`Updating expense cache: ${operation} expense ${expense.id}`);
  
  // Update all expenses cache
  const allExpensesKey = ['all_expenses', userId];
  queryClient.setQueryData(allExpensesKey, (oldData: Expense[] | undefined) => {
    if (!oldData) return [];
    
    switch (operation) {
      case 'add':
        console.log('Adding expense to all expenses cache');
        return [expense, ...oldData];
      case 'update':
        console.log('Updating expense in all expenses cache');
        return oldData.map(exp => exp.id === expense.id ? expense : exp);
      case 'delete':
        console.log('Removing expense from all expenses cache');
        return oldData.filter(exp => exp.id !== expense.id);
      default:
        return oldData;
    }
  });

  // Update monthly expenses cache
  const expenseDate = new Date(expense.date);
  const monthKey = format(expenseDate, 'yyyy-MM');
  const monthlyExpensesKey = ['expenses', monthKey, userId];
  
  queryClient.setQueryData(monthlyExpensesKey, (oldData: Expense[] | undefined) => {
    if (!oldData) return [];
    
    switch (operation) {
      case 'add':
        console.log('Adding expense to monthly expenses cache');
        return [expense, ...oldData];
      case 'update':
        console.log('Updating expense in monthly expenses cache');
        return oldData.map(exp => exp.id === expense.id ? expense : exp);
      case 'delete':
        console.log('Removing expense from monthly expenses cache');
        return oldData.filter(exp => exp.id !== expense.id);
      default:
        return oldData;
    }
  });

  console.log('Cache update completed successfully');
}
