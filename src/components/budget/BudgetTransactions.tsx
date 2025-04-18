import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/chartUtils";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Budget } from "@/pages/Budget";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

interface BudgetTransactionsProps {
  budgets?: Budget[];
}

export function BudgetTransactions({ budgets = [] }: BudgetTransactionsProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // Fetch real expenses from Supabase
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .limit(20); // Limit to latest 20 for better mobile performance
      
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

  // Find relevant budget for each expense
  const getBudgetForExpense = (expense: any) => {
    return budgets.find(budget => budget.category === expense.category) || null;
  };

  return (
    <div className="space-y-3 w-full overflow-hidden max-w-full">
      {isMobile ? (
        // Mobile card view - simplified for better mobile experience
        <div className="space-y-2 w-full overflow-hidden">
          {expenses.map((transaction) => {
            const relatedBudget = getBudgetForExpense(transaction);
            const budgetAmount = relatedBudget ? Number(relatedBudget.amount) : 0;
            
            return (
              <Card key={transaction.id} className="overflow-hidden border-border/40 shadow-sm w-full">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start w-full">
                    <div className="space-y-1 overflow-hidden max-w-[60%]">
                      <div className="font-medium truncate">{transaction.description}</div>
                      <div className="flex gap-1 text-xs text-muted-foreground flex-wrap">
                        <span className="truncate">{format(new Date(transaction.date), 'MMM dd')}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="capitalize truncate">{transaction.category}</span>
                      </div>
                    </div>
                    <div className="text-right font-semibold min-w-[80px] flex-shrink-0">
                      {formatCurrency(Number(transaction.amount))}
                      {relatedBudget && (
                        <div className="text-xs text-muted-foreground">
                          Budget: {formatCurrency(budgetAmount)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // Desktop table view
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Budget</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((transaction) => {
              const relatedBudget = getBudgetForExpense(transaction);
              const budgetAmount = relatedBudget ? Number(relatedBudget.amount) : 0;
              
              return (
                <TableRow key={transaction.id}>
                  <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{formatCurrency(Number(transaction.amount))}</TableCell>
                  <TableCell>
                    {relatedBudget ? (
                      <div className="flex flex-col">
                        <span>{formatCurrency(budgetAmount)}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {relatedBudget.period}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">No budget</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
