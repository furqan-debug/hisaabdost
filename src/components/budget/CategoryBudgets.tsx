
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
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfMonth } from "date-fns";

interface CategoryBudgetsProps {
  budgets: Budget[];
  onEditBudget: (budget: Budget) => void;
}

export function CategoryBudgets({ budgets, onEditBudget }: CategoryBudgetsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch expenses
  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

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

  const getSpentAmount = (budget: Budget) => {
    if (!expenses) return 0;

    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return (
          expense.category === budget.category &&
          expenseDate >= start &&
          expenseDate <= end
        );
      })
      .reduce((total, expense) => total + Number(expense.amount), 0);
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
            const spentAmount = getSpentAmount(budget);
            const remainingAmount = budget.amount - spentAmount;
            const progress = (spentAmount / budget.amount) * 100;

            return (
              <TableRow key={budget.id}>
                <TableCell>{budget.category}</TableCell>
                <TableCell className="capitalize">{budget.period}</TableCell>
                <TableCell>{formatCurrency(budget.amount)}</TableCell>
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
