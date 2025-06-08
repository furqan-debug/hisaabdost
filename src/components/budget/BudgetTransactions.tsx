
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
import { Receipt, Calendar, Tag, CreditCard, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Budget Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!hasBudgets) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Budget Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <p className="text-lg font-medium text-muted-foreground mb-2">No budget categories set up yet</p>
            <p className="text-sm text-muted-foreground/80">
              Create a budget first to see your transactions against your budget
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (expenses.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Budget Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <p className="text-lg font-medium text-muted-foreground mb-2">No transactions found</p>
            <p className="text-sm text-muted-foreground/80">
              Add some expenses to see them here
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const getBudgetForExpense = (expense: any) => {
    return budgets.find(budget => budget.category === expense.category) || null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/20">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/30 to-primary/20 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            Budget Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isMobile ? (
            <div className="space-y-4">
              {expenses.map((transaction, index) => {
                const relatedBudget = getBudgetForExpense(transaction);
                const budgetAmount = relatedBudget ? Number(relatedBudget.amount) : 0;
                
                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-gradient-to-br from-background/90 to-background/70 border-0 shadow-md hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                              <CreditCard className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-foreground truncate">{transaction.description}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            <p className="font-bold text-lg text-foreground">
                              {formatCurrency(Number(transaction.amount), currencyCode)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-border/30">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg flex items-center justify-center">
                              <Tag className="w-3 h-3 text-secondary-foreground" />
                            </div>
                            <span className="text-sm font-medium text-foreground capitalize">{transaction.category}</span>
                          </div>
                          {relatedBudget && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Budget</p>
                              <p className="text-sm font-medium text-foreground">
                                {formatCurrency(budgetAmount, currencyCode)}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border/30">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((transaction, index) => {
                    const relatedBudget = getBudgetForExpense(transaction);
                    const budgetAmount = relatedBudget ? Number(relatedBudget.amount) : 0;
                    
                    return (
                      <motion.tr 
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                              <Tag className="w-3 h-3 text-primary" />
                            </div>
                            <span className="capitalize font-medium">{transaction.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell className="font-bold text-lg">
                          {formatCurrency(Number(transaction.amount), currencyCode)}
                        </TableCell>
                        <TableCell>
                          {relatedBudget ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold">{formatCurrency(budgetAmount, currencyCode)}</span>
                              <span className="text-xs text-muted-foreground capitalize bg-muted/50 px-2 py-1 rounded-full">
                                {relatedBudget.period}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm italic">No budget set</span>
                          )}
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
