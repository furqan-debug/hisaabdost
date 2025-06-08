
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
import { Receipt, Calendar, Tag, CreditCard, FileText, ShoppingBag } from "lucide-react";
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
        className="space-y-6"
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Budget Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
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
        className="min-h-[600px] flex items-center justify-center"
      >
        <Card className="w-full max-w-md mx-auto text-center border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="pb-8 pt-12">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl flex items-center justify-center mb-6">
              <Receipt className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Budget Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-12">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">No budget categories set up yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
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
        className="min-h-[600px] flex items-center justify-center"
      >
        <Card className="w-full max-w-md mx-auto text-center border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="pb-8 pt-12">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-3xl flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Budget Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-12">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">No transactions found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
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
      className="space-y-8"
    >
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-b border-gray-200 dark:border-gray-700 pb-6">
          <CardTitle className="text-3xl font-bold flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Budget Transactions
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          {isMobile ? (
            <div className="space-y-6">
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
                    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                              <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate">{transaction.description}</h4>
                              <div className="flex items-center gap-3 mt-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-2xl text-gray-900 dark:text-white">
                              {formatCurrency(Number(transaction.amount), currencyCode)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl flex items-center justify-center">
                              <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-base font-bold text-gray-900 dark:text-white capitalize">{transaction.category}</span>
                          </div>
                          {relatedBudget && (
                            <div className="text-right bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-xl">
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wide">Budget</p>
                              <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
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
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-650 border-b border-gray-200 dark:border-gray-600">
                    <TableHead className="font-bold text-gray-900 dark:text-white py-4">Date</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Category</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Description</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Amount</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Budget</TableHead>
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
                        className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <TableCell className="font-bold text-gray-900 dark:text-white py-4">
                          {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
                              <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="capitalize font-bold text-gray-900 dark:text-white">{transaction.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-gray-900 dark:text-white">{transaction.description}</TableCell>
                        <TableCell className="font-bold text-xl text-gray-900 dark:text-white">
                          {formatCurrency(Number(transaction.amount), currencyCode)}
                        </TableCell>
                        <TableCell>
                          {relatedBudget ? (
                            <div className="flex flex-col gap-2">
                              <span className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(budgetAmount, currencyCode)}</span>
                              <span className="text-xs text-gray-600 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-medium">
                                {relatedBudget.period}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm italic bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">No budget set</span>
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
