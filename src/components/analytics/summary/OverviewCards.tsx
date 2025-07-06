
import { Card, CardContent } from "@/components/ui/card";
import { Package, TrendingUp, Target } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";

interface OverviewCardsProps {
  groupsCount: number;
  totalGrouped: number;
  patternsCount: number;
  totalSpending: number;
}

export function OverviewCards({ groupsCount, totalGrouped, patternsCount, totalSpending }: OverviewCardsProps) {
  const { currencyCode } = useCurrency();
  const formatAmount = (amount: number) => formatCurrency(amount, currencyCode);
  const groupedPercentage = totalSpending > 0 ? (totalGrouped / totalSpending) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="border-0 bg-gradient-to-br from-blue-50/80 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 dark:bg-blue-400/10">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Smart Groups</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{groupsCount}</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Similar expenses found</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 bg-gradient-to-br from-green-50/80 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10 dark:bg-green-400/10">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Grouped Spending</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatAmount(totalGrouped)}</p>
              <p className="text-xs text-green-600/70 dark:text-green-400/70">{groupedPercentage.toFixed(1)}% of total spending</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 bg-gradient-to-br from-purple-50/80 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 dark:bg-purple-400/10">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Patterns Found</p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{patternsCount}</p>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Spending behaviors</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
