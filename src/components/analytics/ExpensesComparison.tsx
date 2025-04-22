
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
    <div className="rounded-xl p-6 bg-white shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 pb-6">
        <Card className="rounded-xl shadow-none bg-[#f4fdf8]/60 border border-[#e0e5e9]">
          <CardContent className="pt-6 pb-4">
            <div className="text-2xl font-bold text-gray-800">{format(currentMonthStart, 'MMMM yyyy')}</div>
            <div className="text-sm text-gray-500">Current Month</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-none bg-[#f1f2ff]/60 border border-[#e1e5ee]">
          <CardContent className="pt-6 pb-4">
            <div className="text-2xl font-bold text-gray-800">{format(lastMonthStart, 'MMMM yyyy')}</div>
            <div className="text-sm text-gray-500">Previous Month</div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-5">
        {comparisons.map(({ category, currentAmount, lastAmount, percentageChange, color }) => (
          <div key={category} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-[16px]" style={{ color }}>{category}</span>
              <span className={cn(
                "font-bold text-[14px]",
                percentageChange > 0 ? "text-red-500" : "text-green-500"
              )}>
                {percentageChange > 0 ? "+" : ""}{percentageChange.toFixed(1)}%
              </span>
            </div>
            <div className="flex gap-8 items-end text-sm mb-2">
              <div>
                <div className="text-xs text-gray-500">Current</div>
                <div className="font-medium text-gray-800">{formatCurrency(currentAmount, currencyCode)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Previous</div>
                <div className="font-medium text-gray-800">{formatCurrency(lastAmount, currencyCode)}</div>
              </div>
            </div>
            <Progress
              value={100}
              className={cn(
                "h-3 rounded-full bg-[#e9ecef]",
              )}
              style={{ 
                color: "#27ae60", 
                background: "#e9ecef" 
              }}
            />
          </div>
        ))}
        {comparisons.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Not enough data to compare this period.
          </div>
        )}
      </div>
    </div>
  );
}
