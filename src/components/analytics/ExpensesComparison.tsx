
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
    const percentageChange = lastAmount === 0
      ? (currentAmount > 0 ? 100 : 0)
      : ((currentAmount - lastAmount) / lastAmount) * 100;

    return {
      category,
      currentAmount,
      lastAmount,
      percentageChange,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
    };
  }).filter(comparison => comparison.currentAmount > 0 || comparison.lastAmount > 0);

  return (
    <div className="rounded-xl p-2 sm:p-6 bg-[#fafafb]/70 border border-border/20 glassmorphism">
      <div className="grid gap-4 md:grid-cols-2 pb-4">
        <Card className="rounded-xl shadow-none bg-[#f4fdf8]/60 border border-border/40">
          <CardContent className="pt-6 pb-4">
            <div className="text-2xl font-bold tracking-tight">{format(currentMonthStart, 'MMMM yyyy')}</div>
            <div className="text-sm text-muted-foreground">Current Month</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-none bg-[#e8ebff]/45 border border-border/40">
          <CardContent className="pt-6 pb-4">
            <div className="text-2xl font-bold tracking-tight">{format(lastMonthStart, 'MMMM yyyy')}</div>
            <div className="text-sm text-muted-foreground">Previous Month</div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        {comparisons.map(({ category, currentAmount, lastAmount, percentageChange, color }) => (
          <div key={category} className="space-y-2 px-1 pb-1 rounded-xl bg-background shadow-sm border border-[#f1f4fa]/60">
            <div className="flex justify-between items-center">
              <span className="font-semibold" style={{ color }}>{category}</span>
              <span className={
                percentageChange > 0
                  ? "text-red-400 font-bold"
                  : "text-green-500 font-bold"
              }>
                {percentageChange > 0 ? "+" : ""}{percentageChange.toFixed(1)}%
              </span>
            </div>
            <div className="flex gap-4 items-end text-xs">
              <div>
                <div className="text-xs text-muted-foreground">Current</div>
                <div className="font-medium">{formatCurrency(currentAmount, currencyCode)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Previous</div>
                <div className="font-medium">{formatCurrency(lastAmount, currencyCode)}</div>
              </div>
            </div>
            <Progress
              value={Math.min(100, (currentAmount / (lastAmount || currentAmount)) * 100)}
              className={cn(
                "h-3 rounded-full bg-[hsl(var(--muted)/0.30)] [&>[role=progressbar]]:bg-current transition-all shadow-md",
              )}
              style={{ color, background: `${color}22` }}
            />
          </div>
        ))}
        {comparisons.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Not enough data to compare this period.
          </div>
        )}
      </div>
    </div>
  );
}
