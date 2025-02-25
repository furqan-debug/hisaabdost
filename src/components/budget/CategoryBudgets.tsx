
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Budget } from "@/pages/Budget";
import { formatCurrency } from "@/utils/chartUtils";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface CategoryBudgetsProps {
  budgets: Budget[];
  onEditBudget: (budget: Budget) => void;
}

export function CategoryBudgets({ budgets, onEditBudget }: CategoryBudgetsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDeleteBudget = async (budgetId: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['budgets'] });

      toast({
        title: "Budget deleted",
        description: "The budget has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Error",
        description: "Failed to delete the budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Query expenses directly in the component with proper error handling
  const { data: expenses, error: expensesError } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', firstDayOfMonth.toISOString())
        .lte('date', currentDate.toISOString());
        
      if (error) throw error;
      return data || [];
    },
  });

  if (expensesError) {
    console.error('Error fetching expenses:', expensesError);
  }

  const getSpentAmount = (category: string) => {
    if (!expenses) return 0;
    
    // Make the category comparison case-insensitive
    const categoryExpenses = expenses.filter(
      expense => expense.category.toLowerCase() === category.toLowerCase()
    );
    
    // Sum up all expenses for this category
    return categoryExpenses.reduce((total, expense) => {
      const amount = typeof expense.amount === 'string' 
        ? parseFloat(expense.amount) 
        : Number(expense.amount);
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  return (
    <div className="space-y-4">
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
          {budgets.map((budget) => {
            const spentAmount = getSpentAmount(budget.category);
            const remainingAmount = Number(budget.amount) - spentAmount;
            const progress = Number(budget.amount) > 0 
              ? Math.min((spentAmount / Number(budget.amount)) * 100, 100)
              : 0;

            return (
              <TableRow key={budget.id}>
                <TableCell>{budget.category}</TableCell>
                <TableCell className="capitalize">{budget.period}</TableCell>
                <TableCell>{formatCurrency(Number(budget.amount))}</TableCell>
                <TableCell>{formatCurrency(spentAmount)}</TableCell>
                <TableCell>{formatCurrency(remainingAmount)}</TableCell>
                <TableCell className="w-[200px]">
                  <Progress value={progress} className="w-full" />
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
                        onClick={() => handleDeleteBudget(budget.id)}
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
  );
}
