
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Budget } from "@/pages/Budget";
import { formatCurrency } from "@/utils/chartUtils";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import type { Expense } from "@/types/database";

interface CategoryBudgetsProps {
  budgets: Budget[];
  onEditBudget: (budget: Budget) => void;
}

export function CategoryBudgets({ budgets, onEditBudget }: CategoryBudgetsProps) {
  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as unknown as Expense[];
    }
  });

  const getSpentAmount = (budget: Budget) => {
    if (!expenses) return 0;
    
    // Filter expenses by category and sum their amounts
    return expenses
      .filter(expense => expense.category === budget.category)
      .reduce((sum, expense) => sum + expense.amount, 0);
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
                  <Button variant="outline" size="sm" onClick={() => onEditBudget(budget)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
