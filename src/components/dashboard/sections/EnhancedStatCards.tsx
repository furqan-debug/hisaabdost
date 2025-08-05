
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Target } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useCurrency } from "@/hooks/use-currency";

interface EnhancedStatCardsProps {
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  savingsRate: number;
  walletBalance: number;
}

export function EnhancedStatCards({
  totalBalance,
  monthlyExpenses,
  monthlyIncome,
  savingsRate,
  walletBalance
}: EnhancedStatCardsProps) {
  const { currencyCode } = useCurrency();

  const cards = [
    {
      title: "Wallet Balance",
      value: formatCurrency(walletBalance, currencyCode),
      icon: Wallet,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-600",
      trend: { value: 5.2, isPositive: true }
    },
    {
      title: "Monthly Income",
      value: formatCurrency(monthlyIncome, currencyCode),
      icon: TrendingUp,
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-600",
      trend: { value: 2.8, isPositive: true }
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(monthlyExpenses, currencyCode),
      icon: DollarSign,
      gradient: "from-red-500/20 to-pink-500/20",
      iconColor: "text-red-600",
      trend: { value: 1.2, isPositive: false }
    },
    {
      title: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      icon: Target,
      gradient: "from-purple-500/20 to-indigo-500/20",
      iconColor: "text-purple-600",
      trend: { value: 3.4, isPositive: true }
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: index * 0.1,
            duration: 0.5,
            ease: "easeOut"
          }}
          whileHover={{ 
            y: -5,
            transition: { duration: 0.2 }
          }}
        >
          <Card className={`relative overflow-hidden border-0 shadow-lg bg-gradient-to-br ${card.gradient} backdrop-blur-sm hover:shadow-xl transition-all duration-300`}>
            <CardContent className="p-6 relative">
              {/* Animated background pattern */}
              <motion.div
                className="absolute top-0 right-0 w-24 h-24 opacity-10"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <card.icon className="w-full h-full" />
              </motion.div>
              
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/10 backdrop-blur-sm ${card.iconColor}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                
                {/* Trend indicator */}
                <motion.div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    card.trend.isPositive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {card.trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {card.trend.value}%
                </motion.div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {card.title}
                </p>
                <motion.p
                  className="text-2xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  {card.value}
                </motion.p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
