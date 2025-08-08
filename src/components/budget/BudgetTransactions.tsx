import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Budget } from "@/pages/Budget";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { useEffect } from "react";

interface BudgetTransactionsProps {
  budgets?: Budget[];
}

export function BudgetTransactions({ budgets = [] }: BudgetTransactionsProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  const queryClient = useQueryClient();
  
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!user,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true
  });

  // Listen for expense changes and refresh data
  useEffect(() => {
    const handleExpenseUpdate = () => {
      console.log('BudgetTransactions: Refreshing expenses due to expense change');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    };

    const events = [
      'expense-added',
      'expense-updated', 
      'expense-deleted',
      'expenses-updated',
      'budget-refresh'
    ];

    events.forEach(event => {
      window.addEventListener(event, handleExpenseUpdate);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleExpenseUpdate);
      });
    };
  }, [queryClient]);

  const hasBudgets = budgets.length > 0 && budgets.some(budget => Number(budget.amount) > 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasBudgets) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <p className="text-muted-foreground mb-2">No budget categories have been set up yet.</p>
            <p className="text-sm text-muted-foreground">Create a budget first to see your transactions against your budget.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <p className="text-muted-foreground mb-2">No transactions found.</p>
            <p className="text-sm text-muted-foreground">Add some expenses to see them here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBudgetForExpense = (expense: any) => {
    return budgets.find(budget => budget.category === expense.category) || null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 w-full overflow-hidden max-w-full">
          {isMobile ? (
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
                          {formatCurrency(Number(transaction.amount), currencyCode)}
                          {relatedBudget && (
                            <div className="text-xs text-muted-foreground">
                              Budget: {formatCurrency(budgetAmount, currencyCode)}
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
                      <TableCell>{formatCurrency(Number(transaction.amount), currencyCode)}</TableCell>
                      <TableCell>
                        {relatedBudget ? (
                          <div className="flex flex-col">
                            <span>{formatCurrency(budgetAmount, currencyCode)}</span>
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
      </CardContent>
    </Card>
  );
}
