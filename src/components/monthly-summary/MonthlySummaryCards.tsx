
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, Wallet, Target } from "lucide-react";

interface MonthlySummaryCardsProps {
  walletBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  isLoading?: boolean;
}

export const MonthlySummaryCards = ({
  walletBalance,
  monthlyIncome,
  monthlyExpenses,
  savingsRate,
  isLoading = false
}: MonthlySummaryCardsProps) => {
  const { currencyCode } = useCurrency();

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Wallet Balance",
      value: formatCurrency(walletBalance, currencyCode),
      icon: Wallet,
      color: "text-blue-600"
    },
    {
      title: "Monthly Income",
      value: formatCurrency(monthlyIncome, currencyCode),
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(monthlyExpenses, currencyCode),
      icon: DollarSign,
      color: "text-red-600"
    },
    {
      title: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      icon: Target,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="shadow-md border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
