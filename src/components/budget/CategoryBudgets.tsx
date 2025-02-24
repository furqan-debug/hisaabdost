
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Budget } from "@/pages/Budget";
import { formatCurrency } from "@/utils/chartUtils";
import { Progress } from "@/components/ui/progress";
import type { Expense } from "@/types/database";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

interface CategoryBudgetsProps {
  budgets: Budget[];
  expenses: Expense[];
  onEditBudget: (budget: Budget) => void;
}

export function CategoryBudgets({ budgets, expenses, onEditBudget }: CategoryBudgetsProps) {
  const getSpentAmount = (budget: Budget) => {
    if (!expenses) return 0;
    
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    const endOfCurrentMonth = endOfMonth(today);
    
    // Filter expenses based on category and period
    const relevantExpenses = expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      const matchesCategory = expense.category.toLowerCase() === budget.category.toLowerCase();
      
      // Different date range based on budget period
      if (budget.period === 'monthly') {
        return matchesCategory && isWithinInterval(expenseDate, {
          start: startOfCurrentMonth,
          end: endOfCurrentMonth
        });
      } else if (budget.period === 'yearly') {
        return matchesCategory && expenseDate.getFullYear() === today.getFullYear();
      }
      // Add quarterly logic if needed
      return matchesCategory;
    });

    console.log(`Category ${budget.category} - Period ${budget.period}:`, relevantExpenses);
    
    const total = relevantExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    console.log(`Total spent for ${budget.category}: ${total}`);
    
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
