
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/utils/formatters";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertCircle, DollarSign, TrendingUp, TrendingDown, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";

interface BudgetSummaryCardsProps {
  totalBudget: number;
  remainingBalance: number;
  usagePercentage: number;
  monthlyIncome: number;
  isLoading?: boolean;
}

export const BudgetSummaryCards = ({
  totalBudget,
  remainingBalance,
  usagePercentage,
  monthlyIncome,
  isLoading = false
}: BudgetSummaryCardsProps) => {
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  
  const exceedsBudget = totalBudget > monthlyIncome && monthlyIncome > 0;
  const totalSpent = totalBudget - remainingBalance;

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Budget",
      value: formatCurrency(totalBudget, currencyCode),
      icon: Target,
      gradient: "from-blue-500/20 to-blue-600/10",
      iconBg: "from-blue-500/30 to-blue-600/20",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Total Spent",
      value: formatCurrency(totalSpent, currencyCode),
      icon: TrendingDown,
      gradient: "from-red-500/20 to-red-600/10",
      iconBg: "from-red-500/30 to-red-600/20",
      textColor: "text-red-600 dark:text-red-400"
    },
    {
      title: "Remaining",
      value: formatCurrency(remainingBalance, currencyCode),
      icon: remainingBalance >= 0 ? TrendingUp : TrendingDown,
      gradient: remainingBalance >= 0 ? "from-green-500/20 to-green-600/10" : "from-red-500/20 to-red-600/10",
      iconBg: remainingBalance >= 0 ? "from-green-500/30 to-green-600/20" : "from-red-500/30 to-red-600/20",
      textColor: remainingBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
    },
    {
      title: "Usage",
      value: `${usagePercentage.toFixed(1)}%`,
      icon: DollarSign,
      gradient: usagePercentage > 100 ? "from-red-500/20 to-red-600/10" : "from-purple-500/20 to-purple-600/10",
      iconBg: usagePercentage > 100 ? "from-red-500/30 to-red-600/20" : "from-purple-500/30 to-purple-600/20",
      textColor: usagePercentage > 100 ? "text-red-600 dark:text-red-400" : "text-purple-600 dark:text-purple-400"
    }
  ];

  return (
    <div className="w-full space-y-4">
      {exceedsBudget && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert variant="destructive" className="rounded-xl border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              ⚠️ Your total budget exceeds your monthly income by {formatCurrency(totalBudget - monthlyIncome, currencyCode)}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
      
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`} />
              <CardContent className="relative p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">
                      {card.title}
                    </p>
                    <p className={`text-lg md:text-2xl font-bold ${card.textColor} break-words`}>
                      {card.value}
                    </p>
                  </div>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <card.icon className="w-4 h-4 md:w-5 md:h-5 text-current" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
