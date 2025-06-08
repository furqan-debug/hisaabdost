
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
import { Receipt, Calendar, Tag, ShoppingBag } from "lucide-react";
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
      <div className="space-y-4 p-4 max-w-7xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl">Budget Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasBudgets) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">
              Budget Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-2">No budget categories set up yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Create a budget first to see your transactions against your budget
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">
              Budget Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-2">No transactions found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Add some expenses to see them here
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getBudgetForExpense = (expense: any) => {
    return budgets.find(budget => budget.category === expense.category) || null;
  };

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Receipt className="w-5 h-5 text-purple-600" />
              Budget Transactions
            </CardTitle>
          </CardHeader>
          
          <CardContent>
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
                      <Card className="bg-gray-50 dark:bg-gray-700/50 border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{transaction.description}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-gray-900 dark:text-white">
                                {formatCurrency(Number(transaction.amount), currencyCode)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{transaction.category}</span>
                            </div>
                            {relatedBudget && (
                              <div className="text-right bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-lg">
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Budget</p>
                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
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
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-600 border-b border-gray-200 dark:border-gray-500">
                      <TableHead className="font-semibold text-gray-900 dark:text-white py-3">Date</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Category</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Description</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Amount</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white">Budget</TableHead>
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
                          className="hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
                        >
                          <TableCell className="font-medium text-gray-900 dark:text-white py-3">
                            {format(new Date(transaction.date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-blue-600" />
                              <span className="capitalize font-medium text-gray-900 dark:text-white">{transaction.category}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-gray-900 dark:text-white">{transaction.description}</TableCell>
                          <TableCell className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(Number(transaction.amount), currencyCode)}
                          </TableCell>
                          <TableCell>
                            {relatedBudget ? (
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(budgetAmount, currencyCode)}</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                  {relatedBudget.period}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 text-sm italic bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">No budget set</span>
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
    </div>
  );
}
