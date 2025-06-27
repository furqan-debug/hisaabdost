
import { Card, CardContent } from "@/components/ui/card";
import { Package, Users, Target } from "lucide-react";
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
  const groupedPercentage = (totalGrouped / totalSpending) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Smart Groups</p>
              <p className="text-2xl font-bold">{groupsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Grouped Spending</p>
              <p className="text-2xl font-bold">{formatAmount(totalGrouped)}</p>
              <p className="text-xs text-green-600">{groupedPercentage.toFixed(1)}% of total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Patterns Found</p>
              <p className="text-2xl font-bold">{patternsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
