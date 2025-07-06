
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";

interface SpendingPatternsAnalysisProps {
  spendingPatterns: any[];
  totalSpending: number;
}

export function SpendingPatternsAnalysis({ spendingPatterns, totalSpending }: SpendingPatternsAnalysisProps) {
  const { currencyCode } = useCurrency();
  const formatAmount = (amount: number) => formatCurrency(amount, currencyCode);

  if (spendingPatterns.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          Spending Pattern Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground ml-10">
          Understanding your spending behavior
        </p>
      </CardHeader>
      <CardContent className="ml-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spendingPatterns.slice(0, 4).map((pattern, index) => (
            <motion.div
              key={pattern.pattern}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="border border-border/50 rounded-xl p-5 bg-gradient-to-br from-background to-muted/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-base capitalize">
                  {pattern.pattern.replace('_', ' & ')}
                </h4>
                <Badge variant={pattern.count > 3 ? "default" : "secondary"} className="text-xs">
                  {pattern.count} times
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Total Amount</span>
                    <span className="font-bold text-lg">{formatAmount(pattern.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Average per expense</span>
                    <span className="font-medium">{formatAmount(pattern.averageAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">% of total spending</span>
                    <span className="font-medium text-primary">
                      {((pattern.totalAmount / totalSpending) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {pattern.totalAmount * 12 > 5000 && (
                  <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-3 dark:bg-amber-950/20 dark:border-amber-800/30">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                      💰 Annual Impact: {formatAmount(pattern.totalAmount * 12)}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
