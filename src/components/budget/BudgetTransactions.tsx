
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/chartUtils";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Budget } from "@/pages/Budget";

interface BudgetTransactionsProps {
  budgets?: Budget[];
}

export function BudgetTransactions({ budgets = [] }: BudgetTransactionsProps) {
  const { user } = useAuth();
  
  // Fetch real expenses from Supabase
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!user,
  });

  // Check if there are any budgets set
  const hasBudgets = budgets.length > 0 && budgets.some(budget => Number(budget.amount) > 0);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  if (!hasBudgets) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <p className="text-muted-foreground mb-2">No budget categories have been set up yet.</p>
        <p className="text-sm text-muted-foreground">Create a budget first to see your transactions against your budget.</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <p className="text-muted-foreground mb-2">No transactions found.</p>
        <p className="text-sm text-muted-foreground">Add some expenses to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{transaction.category}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{formatCurrency(Number(transaction.amount))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
