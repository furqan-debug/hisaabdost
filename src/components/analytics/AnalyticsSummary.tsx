
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";

interface AnalyticsSummaryProps {
  expenses: any[];
}

export function AnalyticsSummary({ expenses }: AnalyticsSummaryProps) {
  const { currencyCode } = useCurrency();

  if (!expenses.length) {
    return (
      <div className="text-center text-muted-foreground py-4">
        Add some expenses to see your spending summary
      </div>
    );
  }

  // Helper function to safely convert amount to number
  const getValidAmount = (amount: any): number => {
    if (typeof amount === 'number') return isNaN(amount) ? 0 : amount;
    if (typeof amount === 'string') {
      const parsed = parseFloat(amount);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Calculate top spending category with proper number handling
  const categoryTotals = expenses.reduce((acc, exp) => {
    const amount = getValidAmount(exp.amount);
    acc[exp.category] = (acc[exp.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = (Object.entries(categoryTotals) as [string, number][])
    .sort(([,a], [,b]) => b - a)[0];

  const totalSpent = expenses.reduce((sum, exp) => {
    const amount = getValidAmount(exp.amount);
    return sum + amount;
  }, 0);

  if (!topCategory) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 mb-6 border border-border/50">
      <div className="text-center">
        <p className="text-lg font-medium text-foreground mb-2">
          You spent most on <span className="font-semibold text-primary">{topCategory[0]}</span> this period
        </p>
        <p className="text-2xl font-bold text-primary">
          {formatCurrency(topCategory[1], currencyCode)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Total spending: {formatCurrency(totalSpent, currencyCode)}
        </p>
      </div>
    </div>
  );
}
