
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/pages/Budget";
import { formatCurrency } from "@/utils/formatters";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Pencil, Trash2, Layers } from "lucide-react";
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
      
      // Delete directly from the database
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
        
        // Manually trigger refresh events
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
      <div className="w-full max-w-full overflow-hidden">
        <Card className="w-full bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Budget Categories</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                <Layers className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">No budget categories found</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Add your first budget to start tracking your spending by category
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <Card className="w-full bg-card/50 backdrop-blur-sm border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Budget Categories</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="w-full space-y-4">
            {isMobile ? (
              <div className="w-full space-y-4">
                {filteredBudgets.map((budget) => {
                  const spentAmount = getSpentAmount(budget.category);
                  const remainingAmount = Number(budget.amount) - spentAmount;
                  const progress = Number(budget.amount) > 0 
                    ? Math.min((spentAmount / Number(budget.amount)) * 100, 100)
                    : 0;
                  const isOverBudget = spentAmount > Number(budget.amount);

                  return (
                    <Card 
                      key={budget.id} 
                      className={`w-full bg-background/50 border-border/40 shadow-sm ${isOverBudget ? 'border-l-4 border-l-red-500' : ''}`}
                    >
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-start w-full">
                          <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="font-semibold text-base text-foreground truncate">{budget.category}</h3>
                            <p className="text-xs text-muted-foreground capitalize">{budget.period}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
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
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 w-full">
                          <div className="bg-card/60 p-3 rounded-lg border border-border/30">
                            <p className="text-muted-foreground text-xs mb-1">Budgeted</p>
                            <p className="font-semibold text-sm text-foreground truncate">{formatCurrency(Number(budget.amount), currencyCode)}</p>
                          </div>
                          <div className="bg-card/60 p-3 rounded-lg border border-border/30">
                            <p className="text-muted-foreground text-xs mb-1">Spent</p>
                            <p className={`font-semibold text-sm truncate ${isOverBudget ? 'text-red-500' : 'text-foreground'}`}>{formatCurrency(spentAmount, currencyCode)}</p>
                          </div>
                          <div className="bg-card/60 p-3 rounded-lg border border-border/30">
                            <p className="text-muted-foreground text-xs mb-1">Remaining</p>
                            <p className={`font-semibold text-sm truncate ${remainingAmount < 0 ? 'text-red-500' : 'text-foreground'}`}>{formatCurrency(remainingAmount, currencyCode)}</p>
                          </div>
                          <div className="bg-card/60 p-3 rounded-lg border border-border/30">
                            <p className="text-muted-foreground text-xs mb-1">Progress</p>
                            <p className="font-semibold text-sm">{progress.toFixed(0)}%</p>
                          </div>
                        </div>
                        
                        <div className="w-full">
                          <Progress 
                            value={progress} 
                            className={`w-full h-3 ${isOverBudget ? 'bg-red-200' : 'bg-muted'}`} 
                            indicatorClassName={isOverBudget ? 'bg-red-500' : 'bg-primary'}
                          />
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
                      <TableHead>Category</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Budgeted</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBudgets.map((budget) => {
                      const spentAmount = getSpentAmount(budget.category);
                      const remainingAmount = Number(budget.amount) - spentAmount;
                      const progress = Number(budget.amount) > 0 
                        ? Math.min((spentAmount / Number(budget.amount)) * 100, 100)
                        : 0;
                      const isOverBudget = spentAmount > Number(budget.amount);

                      return (
                        <TableRow key={budget.id} className={isOverBudget ? 'bg-red-50/10' : undefined}>
                          <TableCell className="font-medium">{budget.category}</TableCell>
                          <TableCell className="capitalize">{budget.period}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(Number(budget.amount), currencyCode)}</TableCell>
                          <TableCell className={isOverBudget ? 'text-red-500 font-medium' : 'font-medium'}>
                            {formatCurrency(spentAmount, currencyCode)}
                          </TableCell>
                          <TableCell className={remainingAmount < 0 ? 'text-red-500 font-medium' : 'font-medium'}>
                            {formatCurrency(remainingAmount, currencyCode)}
                          </TableCell>
                          <TableCell className="w-[200px]">
                            <Progress 
                              value={progress} 
                              className={`h-3 ${isOverBudget ? 'bg-red-200' : 'bg-muted'}`} 
                              indicatorClassName={isOverBudget ? 'bg-red-500' : 'bg-primary'}
                            />
                          </TableCell>
                          <TableCell>
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
