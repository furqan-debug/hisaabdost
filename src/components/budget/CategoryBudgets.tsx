import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/pages/Budget";
import { formatCurrency } from "@/utils/formatters";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Pencil, Trash2, Layers, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
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
        className="w-full max-w-none"
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm mx-auto">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Budget Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <p className="text-lg font-medium text-muted-foreground mb-2">No budget categories found</p>
            <p className="text-sm text-muted-foreground/80">
              Add your first budget to start tracking your spending by category
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
      className="w-full max-w-none"
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm overflow-hidden mx-auto">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/20 px-6 py-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/30 to-primary/20 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            Budget Categories
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
                    <Card className={`relative overflow-hidden bg-gradient-to-br from-background/90 to-background/70 border-0 shadow-md hover:shadow-lg transition-all duration-200 ${isOverBudget ? 'ring-2 ring-red-500/20' : ''}`}>
                      {isOverBudget && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-400"></div>
                      )}
                      
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                              <DollarSign className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold text-xl text-foreground">{budget.category}</h3>
                              <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
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
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Budgeted</p>
                            <p className="text-base font-bold text-blue-700 dark:text-blue-300">
                              {formatCurrency(Number(budget.amount), currencyCode)}
                            </p>
                          </div>
                          
                          <div className={`p-4 rounded-xl border ${isOverBudget 
                            ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200/50 dark:border-red-800/30' 
                            : 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200/50 dark:border-green-800/30'
                          }`}>
                            <p className={`text-sm font-medium mb-2 ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                              Spent
                            </p>
                            <p className={`text-base font-bold ${isOverBudget ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                              {formatCurrency(spentAmount, currencyCode)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Progress</span>
                            <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-foreground'}`}>
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                          
                          <Progress 
                            value={progress} 
                            className="h-3 bg-muted/50"
                            indicatorClassName={`transition-all duration-500 ${isOverBudget ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-primary to-primary/80'}`}
                          />
                          
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-sm text-muted-foreground">Remaining</span>
                            <span className={`text-base font-semibold ${remainingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(remainingAmount, currencyCode)}
                            </span>
                          </div>
                        </div>

                        {isOverBudget && (
                          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600 dark:text-red-400 font-medium">Over budget</span>
                          </div>
                        )}
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
                    <TableHead className="font-semibold text-base px-6 py-4">Category</TableHead>
                    <TableHead className="font-semibold text-base px-6 py-4">Period</TableHead>
                    <TableHead className="font-semibold text-base px-6 py-4">Budgeted</TableHead>
                    <TableHead className="font-semibold text-base px-6 py-4">Spent</TableHead>
                    <TableHead className="font-semibold text-base px-6 py-4">Remaining</TableHead>
                    <TableHead className="font-semibold text-base px-6 py-4">Progress</TableHead>
                    <TableHead className="font-semibold text-base px-6 py-4">Actions</TableHead>
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
                        className={`group hover:bg-muted/30 transition-colors ${isOverBudget ? 'bg-red-50/30 dark:bg-red-950/10' : ''}`}
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-semibold text-base">{budget.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-muted-foreground px-6 py-4">{budget.period}</TableCell>
                        <TableCell className="font-semibold text-base px-6 py-4">{formatCurrency(Number(budget.amount), currencyCode)}</TableCell>
                        <TableCell className={`font-semibold text-base px-6 py-4 ${isOverBudget ? 'text-red-600' : 'text-foreground'}`}>
                          {formatCurrency(spentAmount, currencyCode)}
                        </TableCell>
                        <TableCell className={`font-semibold text-base px-6 py-4 ${remainingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(remainingAmount, currencyCode)}
                        </TableCell>
                        <TableCell className="w-[240px] px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Progress 
                              value={progress} 
                              className="h-3 flex-1 bg-muted/50"
                              indicatorClassName={isOverBudget ? 'bg-red-500' : 'bg-primary'}
                            />
                            <span className={`text-sm font-medium min-w-[50px] ${isOverBudget ? 'text-red-600' : 'text-foreground'}`}>
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
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
