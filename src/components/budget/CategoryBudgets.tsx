
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/pages/Budget";
import { formatCurrency } from "@/utils/formatters";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Pencil, Trash2, Layers, TrendingUp, DollarSign, AlertTriangle, Target } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { startOfMonth } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrency } from "@/hooks/use-currency";
import { useEffect } from "react";
import { motion } from "framer-motion";

interface CategoryBudgetsProps {
  budgets: Budget[];
  onEditBudget: (budget: Budget) => void;
}

export function CategoryBudgets({ budgets, onEditBudget }: CategoryBudgetsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();

  // Listen for budget update events
  useEffect(() => {
    const handleBudgetUpdate = () => {
      console.log("Budget update detected in CategoryBudgets, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    };
    
    window.addEventListener('budget-updated', handleBudgetUpdate);
    window.addEventListener('budget-deleted', handleBudgetUpdate);
    window.addEventListener('budget-refresh', handleBudgetUpdate);
    
    return () => {
      window.removeEventListener('budget-updated', handleBudgetUpdate);
      window.removeEventListener('budget-deleted', handleBudgetUpdate);
      window.removeEventListener('budget-refresh', handleBudgetUpdate);
    };
  }, [queryClient]);

  const handleDeleteBudget = async (budgetId: string, category: string) => {
    try {
      console.log(`Deleting budget for category: ${category}`);
      
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", budgetId);
      
      if (error) {
        console.error("Error deleting budget:", error);
        toast({
          title: "Error",
          description: "Failed to delete the budget. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log("Budget deleted successfully");
        toast({
          title: "Success",
          description: `${category} budget deleted successfully.`,
        });
        
        setTimeout(() => {
          const budgetEvent = new CustomEvent('budget-refresh', { 
            detail: { timestamp: Date.now() }
          });
          window.dispatchEvent(budgetEvent);
        }, 200);
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Error",
        description: "Failed to delete the budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { data: expenses = [], error: expensesError } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const startDate = startOfMonth(new Date());
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0]);
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return data || [];
    },
  });

  if (expensesError) {
    console.error('Error fetching expenses:', expensesError);
  }

  const getSpentAmount = (category: string) => {
    if (!expenses) return 0;
    
    const categoryExpenses = expenses.filter(expense => 
      expense.category.toLowerCase() === category.toLowerCase()
    );
    
    return categoryExpenses.reduce((total, expense) => {
      return total + Number(expense.amount);
    }, 0);
  };

  const filteredBudgets = budgets.filter(
    budget => budget.category !== "CurrencyPreference"
  );

  if (filteredBudgets.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[600px] flex items-center justify-center"
      >
        <Card className="w-full max-w-md mx-auto text-center border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="pb-8 pt-12">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-3xl flex items-center justify-center mb-6">
              <Layers className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Budget Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-12">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">No budget categories found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Add your first budget to start tracking spending by category
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 border-b border-gray-200 dark:border-gray-700 pb-6">
          <CardTitle className="text-3xl font-bold flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Budget Categories
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          {isMobile ? (
            <div className="space-y-6">
              {filteredBudgets.map((budget, index) => {
                const spentAmount = getSpentAmount(budget.category);
                const remainingAmount = Number(budget.amount) - spentAmount;
                const progress = Number(budget.amount) > 0 
                  ? Math.min((spentAmount / Number(budget.amount)) * 100, 100)
                  : 0;
                const isOverBudget = spentAmount > Number(budget.amount);

                return (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                      isOverBudget ? 'ring-2 ring-red-400 dark:ring-red-500' : ''
                    }`}>
                      {isOverBudget && (
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-400"></div>
                      )}
                      
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                              <Target className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-bold text-xl text-gray-900 dark:text-white">{budget.category}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full mt-1">
                                {budget.period}
                              </p>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => onEditBudget(budget)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Budget
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteBudget(budget.id, budget.category)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Budget
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">Budgeted</p>
                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                              {formatCurrency(Number(budget.amount), currencyCode)}
                            </p>
                          </div>
                          
                          <div className={`p-4 rounded-xl border ${isOverBudget 
                            ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200/50 dark:border-red-800/30' 
                            : 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200/50 dark:border-green-800/30'
                          }`}>
                            <p className={`text-xs font-bold mb-2 uppercase tracking-wide ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                              Spent
                            </p>
                            <p className={`text-lg font-bold ${isOverBudget ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                              {formatCurrency(spentAmount, currencyCode)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Progress</span>
                            <span className={`text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-blue-600'}`}>
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                          
                          <Progress 
                            value={progress} 
                            className="h-4 bg-gray-200 dark:bg-gray-700"
                            indicatorClassName={`transition-all duration-500 ${isOverBudget ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}
                          />
                          
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</span>
                            <span className={`text-lg font-bold ${remainingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(remainingAmount, currencyCode)}
                            </span>
                          </div>
                        </div>

                        {isOverBudget && (
                          <div className="mt-4 flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <span className="text-sm text-red-600 dark:text-red-400 font-bold">Over budget by {formatCurrency(Math.abs(remainingAmount), currencyCode)}</span>
                          </div>
                        )}
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
                    <TableHead className="font-bold text-gray-900 dark:text-white py-4">Category</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Period</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Budgeted</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Spent</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Remaining</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Progress</TableHead>
                    <TableHead className="font-bold text-gray-900 dark:text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBudgets.map((budget, index) => {
                    const spentAmount = getSpentAmount(budget.category);
                    const remainingAmount = Number(budget.amount) - spentAmount;
                    const progress = Number(budget.amount) > 0 
                      ? Math.min((spentAmount / Number(budget.amount)) * 100, 100)
                      : 0;
                    const isOverBudget = spentAmount > Number(budget.amount);

                    return (
                      <motion.tr 
                        key={budget.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors py-3 ${
                          isOverBudget ? 'bg-red-50/50 dark:bg-red-950/10' : ''
                        }`}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center">
                              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-bold text-lg text-gray-900 dark:text-white">{budget.category}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                            {budget.period}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-lg text-gray-900 dark:text-white">
                          {formatCurrency(Number(budget.amount), currencyCode)}
                        </TableCell>
                        <TableCell className={`font-bold text-lg ${isOverBudget ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                          {formatCurrency(spentAmount, currencyCode)}
                        </TableCell>
                        <TableCell className={`font-bold text-lg ${remainingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(remainingAmount, currencyCode)}
                        </TableCell>
                        <TableCell className="w-[250px]">
                          <div className="flex items-center gap-4">
                            <Progress 
                              value={progress} 
                              className="h-3 flex-1 bg-gray-200 dark:bg-gray-700"
                              indicatorClassName={isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'}
                            />
                            <span className={`text-sm font-bold min-w-[50px] ${isOverBudget ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-600">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEditBudget(budget)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteBudget(budget.id, budget.category)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
