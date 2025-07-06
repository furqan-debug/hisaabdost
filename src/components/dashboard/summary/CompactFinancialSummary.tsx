
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, Target } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";
import { motion } from "framer-motion";

interface CompactFinancialSummaryProps {
  walletBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  savingsRate: number;
}

export function CompactFinancialSummary({
  walletBalance,
  monthlyExpenses,
  monthlyIncome,
  savingsRate
}: CompactFinancialSummaryProps) {
  const { currencyCode } = useCurrency();

  const metrics = [
    {
      label: "Available",
      value: formatCurrency(walletBalance, currencyCode),
      icon: Wallet,
      color: "text-blue-600"
    },
    {
      label: "Income",
      value: formatCurrency(monthlyIncome, currencyCode),
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      label: "Spent",
      value: formatCurrency(monthlyExpenses, currencyCode),
      icon: TrendingDown,
      color: "text-red-600"
    },
    {
      label: "Saved",
      value: `${savingsRate.toFixed(1)}%`,
      icon: Target,
      color: "text-purple-600"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.2 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted mb-2`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
                <div className="text-lg font-semibold">{metric.value}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
