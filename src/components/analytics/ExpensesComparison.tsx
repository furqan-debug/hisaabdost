
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { formatCurrency } from "@/utils/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";

interface Expense {
  amount: number;
  category: string;
  date: string;
}

interface ExpensesComparisonProps {
  expenses: Expense[];
}

export function ExpensesComparison({ expenses }: ExpensesComparisonProps) {
  const { currencyCode } = useCurrency();
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(lastMonthStart);

  const currentMonthExpenses = expenses.filter(
    expense => new Date(expense.date) >= currentMonthStart
  );

  const lastMonthExpenses = expenses.filter(
    expense => {
      const date = new Date(expense.date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    }
  );

  const getCategoryTotal = (expenses: Expense[], category: string) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
  };

  const categories = Object.keys(CATEGORY_COLORS);
  const comparisons = categories.map(category => {
    const currentAmount = getCategoryTotal(currentMonthExpenses, category);
    const lastAmount = getCategoryTotal(lastMonthExpenses, category);
    const percentageChange = lastAmount === 0 ? 100 : ((currentAmount - lastAmount) / lastAmount) * 100;

    return {
      category,
      currentAmount,
      lastAmount,
      percentageChange,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
    };
  }).filter(comparison => comparison.currentAmount > 0 || comparison.lastAmount > 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {format(currentMonthStart, 'MMMM yyyy')}
            </div>
            <div className="text-muted-foreground">Current Month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {format(lastMonthStart, 'MMMM yyyy')}
            </div>
            <div className="text-muted-foreground">Previous Month</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {comparisons.map(({ category, currentAmount, lastAmount, percentageChange, color }) => (
          <div key={category} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium" style={{ color }}>{category}</span>
              <span className={percentageChange > 0 ? "text-red-500" : "text-green-500"}>
                {percentageChange.toFixed(1)}%
              </span>
            </div>
            <div className="grid gap-2 grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Current</div>
                <div className="font-medium">{formatCurrency(currentAmount, currencyCode)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Previous</div>
                <div className="font-medium">{formatCurrency(lastAmount, currencyCode)}</div>
              </div>
            </div>
            <Progress 
              value={Math.min(100, (currentAmount / (lastAmount || currentAmount)) * 100)} 
              className={cn(
                "h-2 [&>[role=progressbar]]:bg-current transition-all"
              )}
              style={{ color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
