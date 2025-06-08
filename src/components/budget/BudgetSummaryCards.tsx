
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="w-full space-y-4 p-4 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
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
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Total Spent",
      value: formatCurrency(totalSpent, currencyCode),
      icon: TrendingDown,
      gradient: "from-red-500 to-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400"
    },
    {
      title: "Remaining",
      value: formatCurrency(remainingBalance, currencyCode),
      icon: remainingBalance >= 0 ? TrendingUp : TrendingDown,
      gradient: remainingBalance >= 0 ? "from-green-500 to-green-600" : "from-red-500 to-red-600",
      bgColor: remainingBalance >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20",
      textColor: remainingBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
    },
    {
      title: "Usage",
      value: `${usagePercentage.toFixed(1)}%`,
      icon: DollarSign,
      gradient: usagePercentage > 100 ? "from-red-500 to-red-600" : "from-purple-500 to-purple-600",
      bgColor: usagePercentage > 100 ? "bg-red-50 dark:bg-red-900/20" : "bg-purple-50 dark:bg-purple-900/20",
      textColor: usagePercentage > 100 ? "text-red-600 dark:text-red-400" : "text-purple-600 dark:text-purple-400"
    }
  ];

  return (
    <div className="w-full space-y-4 p-4 max-w-7xl mx-auto">
      {exceedsBudget && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert variant="destructive" className="rounded-lg border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              ⚠️ Your total budget exceeds your monthly income by {formatCurrency(totalBudget - monthlyIncome, currencyCode)}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
      
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`shadow-lg border-0 ${card.bgColor} hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.title}
                    </p>
                    <p className={`text-lg lg:text-2xl font-bold ${card.textColor}`}>
                      {card.value}
                    </p>
                  </div>
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                    <card.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
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
