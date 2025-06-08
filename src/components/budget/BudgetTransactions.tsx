
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Budget } from "@/pages/Budget";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { Receipt, Calendar, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BudgetTransactionsProps {
  budgets?: Budget[];
}

export function BudgetTransactions({ budgets = [] }: BudgetTransactionsProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  
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
  });

  const hasBudgets = budgets.length > 0 && budgets.some(budget => Number(budget.amount) > 0);

  if (isLoading) {
    return (
      <div className="w-full max-w-full overflow-hidden">
        <Card className="w-full bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Budget Transactions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasBudgets) {
    return (
      <div className="w-full max-w-full overflow-hidden">
        <Card className="w-full bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Budget Transactions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                <Receipt className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">No budget categories set up yet</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Create a budget first to see your transactions against your budget
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="w-full max-w-full overflow-hidden">
        <Card className="w-full bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Budget Transactions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                <Receipt className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">No transactions found</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Add some expenses to see them here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getBudgetForExpense = (expense: any) => {
    return budgets.find(budget => budget.category === expense.category) || null;
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <Card className="w-full bg-card/50 backdrop-blur-sm border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Budget Transactions</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="w-full space-y-3">
            {isMobile ? (
              <div className="w-full space-y-3">
                {expenses.map((transaction) => {
                  const relatedBudget = getBudgetForExpense(transaction);
                  const budgetAmount = relatedBudget ? Number(relatedBudget.amount) : 0;
                  
                  return (
                    <Card key={transaction.id} className="w-full bg-background/50 border-border/40 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start w-full mb-3">
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="font-medium text-foreground truncate">{transaction.description}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                          <div className="text-right font-semibold text-foreground ml-3">
                            {formatCurrency(Number(transaction.amount), currencyCode)}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-border/30">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Tag className="w-3 h-3" />
                            <span className="capitalize">{transaction.category}</span>
                          </div>
                          {relatedBudget && (
                            <div className="text-xs text-muted-foreground">
                              Budget: {formatCurrency(budgetAmount, currencyCode)}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
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
                          <TableCell className="capitalize">{transaction.category}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(Number(transaction.amount), currencyCode)}</TableCell>
                          <TableCell>
                            {relatedBudget ? (
                              <div className="flex flex-col">
                                <span className="font-medium">{formatCurrency(budgetAmount, currencyCode)}</span>
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
