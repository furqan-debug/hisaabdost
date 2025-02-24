
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Budget } from "@/pages/Budget";
import { formatCurrency } from "@/utils/chartUtils";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import type { Expense } from "@/types/database";
import { startOfMonth, endOfMonth } from "date-fns";

interface CategoryBudgetsProps {
  budgets: Budget[];
  onEditBudget: (budget: Budget) => void;
}

export function CategoryBudgets({ budgets, onEditBudget }: CategoryBudgetsProps) {
  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      // Get the start and end of the current month
      const startDate = startOfMonth(new Date()).toISOString();
      const endDate = endOfMonth(new Date()).toISOString();

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }

      console.log('Fetched expenses:', data); // Debug log
      return data as unknown as Expense[];
    }
  });

  const getSpentAmount = (budget: Budget) => {
    if (!expenses) return 0;
    
    // Filter expenses by category and sum their amounts
    const categoryExpenses = expenses.filter(expense => 
      expense.category.toLowerCase() === budget.category.toLowerCase()
    );

    const total = categoryExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    // Debug logs
    console.log(`Category: ${budget.category}`);
    console.log('Matching expenses:', categoryExpenses);
    console.log('Total spent:', total);
    
    return total;
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
            const progress = Math.min((spentAmount / budget.amount) * 100, 100);

            return (
              <TableRow key={budget.id}>
                <TableCell>{budget.category}</TableCell>
                <TableCell className="capitalize">{budget.period}</TableCell>
                <TableCell>{formatCurrency(budget.amount)}</TableCell>
                <TableCell>{formatCurrency(spentAmount)}</TableCell>
                <TableCell>{formatCurrency(remainingAmount)}</TableCell>
                <TableCell className="w-[200px]">
                  <Progress 
                    value={progress} 
                    className="w-full" 
                  />
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
