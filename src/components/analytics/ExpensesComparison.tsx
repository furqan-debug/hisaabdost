
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { CATEGORY_COLORS } from "@/utils/chartUtils";
import { formatCurrency } from "@/utils/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  paymentMethod?: string;
  notes?: string;
  isRecurring?: boolean;
  receiptUrl?: string;
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
    // Avoid division by zero, concise calculation
    const percentageChange = lastAmount === 0 && currentAmount > 0
      ? 100
      : lastAmount > 0
      ? ((currentAmount - lastAmount) / lastAmount) * 100
      : 0;

    return {
      category,
      currentAmount,
      lastAmount,
      percentageChange,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
    };
  }).filter(comparison => comparison.currentAmount > 0 || comparison.lastAmount > 0);

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-2 md:gap-4 pb-4">
        <div className="bg-white dark:bg-muted rounded-xl p-4 flex flex-col items-center shadow-sm">
          <span className="text-muted-foreground text-xs font-medium pb-1">Current</span>
          <span className="font-black text-xl md:text-2xl">{format(currentMonthStart, 'MMM yyyy')}</span>
        </div>
        <div className="bg-white dark:bg-muted rounded-xl p-4 flex flex-col items-center shadow-sm">
          <span className="text-muted-foreground text-xs font-medium pb-1">Previous</span>
          <span className="font-black text-xl md:text-2xl">{format(lastMonthStart, 'MMM yyyy')}</span>
        </div>
      </section>

      <div className="space-y-3">
        {comparisons.map(({ category, currentAmount, lastAmount, percentageChange, color }) => (
          <div
            key={category}
            className="rounded-xl p-3 bg-white dark:bg-muted/80 flex flex-col gap-2 shadow-sm"
          >
            <div className="flex items-center gap-2 pb-1">
              <span className="w-3 h-3 rounded-full" style={{ background: color }}/>
              <span className="font-semibold text-sm" style={{ color }}>{category}</span>
              <span className={
                cn("ml-auto font-semibold text-xs",
                  percentageChange > 0 ? "text-red-500" :
                  percentageChange < 0 ? "text-green-500" : "text-gray-400"
                )
              }>
                {percentageChange > 0 ? "+" : ""}
                {percentageChange.toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <span>
                <span className="block text-muted-foreground">Current</span>
                <span className="block font-medium">{formatCurrency(currentAmount, currencyCode)}</span>
              </span>
              <span>
                <span className="block text-muted-foreground">Previous</span>
                <span className="block font-medium">{formatCurrency(lastAmount, currencyCode)}</span>
              </span>
            </div>
            <Progress
              value={lastAmount === 0
                ? (currentAmount > 0 ? 100 : 0)
                : Math.min(100, (currentAmount / lastAmount) * 100)
              }
              className="h-3 rounded-full [&>[role=progressbar]]:bg-[var(--bar-color)] bg-gray-100 dark:bg-muted"
              style={{ "--bar-color": color } as React.CSSProperties}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
