
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Budget } from "@/pages/Budget";
import { formatCurrency } from "@/utils/formatters";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { startOfMonth } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrency } from "@/hooks/use-currency";
import { useEffect } from "react";
import { CurrencyCode } from "@/utils/currencyUtils";
import { getQueryOptions } from "@/lib/queryConfig";

interface CategoryBudgetsProps {
  budgets: Budget[];
}

interface CategoryBudgetCardProps {
  budget: Budget;
  onDeleteBudget: (budgetId: string, category: string) => void;
  spentAmount: number;
  currencyCode: CurrencyCode;
}

const CategoryBudgetCard = ({ budget, onDeleteBudget, spentAmount, currencyCode }: CategoryBudgetCardProps) => {
  const remainingAmount = Number(budget.amount) - spentAmount;
  const progress = Number(budget.amount) > 0 ? Math.min((spentAmount / Number(budget.amount)) * 100, 100) : 0;
  const isOverBudget = spentAmount > Number(budget.amount);

  return (
    <Card className={`budget-glass-card w-full overflow-hidden transition-all duration-300 hover:shadow-lg ${isOverBudget ? 'border-l-4 border-l-destructive' : 'border-l-4 border-l-transparent'}`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-base truncate">{budget.category}</h3>
            <p className="text-xs text-muted-foreground capitalize bg-muted/50 px-2 py-0.5 rounded-full inline-block">{budget.period}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDeleteBudget(budget.id, budget.category)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-2" indicatorClassName={isOverBudget ? 'bg-destructive' : 'bg-primary'} />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>{formatCurrency(spentAmount, currencyCode)}</span>
            <span>{formatCurrency(Number(budget.amount), currencyCode)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className={`font-medium truncate ${remainingAmount < 0 ? 'text-destructive' : ''}`}>{formatCurrency(remainingAmount, currencyCode)}</p>
            </div>
            <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Usage</p>
                <p className="font-medium">{progress.toFixed(0)}%</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryBudgets({
  budgets
}: CategoryBudgetsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();

  // Optimized event handling with debounce
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    
    const handleDataUpdate = (event: CustomEvent) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      
      debounceTimer = setTimeout(() => {
        console.log("CategoryBudgets: Data update detected, refreshing queries", event.type);
        queryClient.invalidateQueries({ queryKey: ['category-expenses'] });
      }, 300); // 300ms debounce
    };

    const eventTypes = [
      'budget-updated', 
      'budget-deleted', 
      'expense-added',
      'expense-updated', 
      'expense-deleted',
      'finny-expense-added'
    ];

    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleDataUpdate as EventListener);
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleDataUpdate as EventListener);
      });
    };
  }, [queryClient]);

  const handleDeleteBudget = async (budgetId: string, category: string) => {
    try {
      console.log(`Deleting budget for category: ${category}`);

      const { error } = await supabase.from("budgets").delete().eq("id", budgetId);
      if (error) {
        console.error("Error deleting budget:", error);
        toast({
          title: "Error",
          description: "Failed to delete the budget. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log("Budget deleted successfully");
        toast({
          title: "Success",
          description: `${category} budget deleted successfully.`
        });

        // Trigger optimized refresh
        queryClient.invalidateQueries({ queryKey: ['budgets'] });
        queryClient.invalidateQueries({ queryKey: ['category-expenses'] });
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Error",
        description: "Failed to delete the budget. Please try again.",
        variant: "destructive"
      });
    }
  };

  const { data: expenses = [], error: expensesError } = useQuery({
    queryKey: ['category-expenses'],
    queryFn: async () => {
      const startDate = startOfMonth(new Date());
      const { data, error } = await supabase.from('expenses').select('*').gte('date', startDate.toISOString().split('T')[0]);
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data || [];
    },
    ...getQueryOptions('EXPENSES'),
  });

  if (expensesError) {
    console.error('Error fetching expenses:', expensesError);
  }

  const getSpentAmount = (category: string) => {
    if (!expenses) return 0;
    const categoryExpenses = expenses.filter(expense => expense.category.toLowerCase() === category.toLowerCase());
    return categoryExpenses.reduce((total, expense) => {
      return total + Number(expense.amount);
    }, 0);
  };

  const filteredBudgets = budgets.filter(budget => budget.category !== "CurrencyPreference");

  if (filteredBudgets.length === 0) {
    return (
      <Card className="budget-glass-card">
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-muted-foreground mb-2">No budget categories found.</p>
            <p className="text-sm text-muted-foreground">Add your first budget to start tracking.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="budget-glass-card">
      <CardHeader className="pb-4">
        <CardTitle>Budget Categories</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-2 sm:px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBudgets.map(budget => {
            const spentAmount = getSpentAmount(budget.category);
            return (
              <CategoryBudgetCard 
                key={budget.id}
                budget={budget}
                onDeleteBudget={handleDeleteBudget}
                spentAmount={spentAmount}
                currencyCode={currencyCode}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
