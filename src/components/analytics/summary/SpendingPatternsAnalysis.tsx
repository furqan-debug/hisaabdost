
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";

interface SpendingPatternsAnalysisProps {
  spendingPatterns: any[];
  totalSpending: number;
}

export function SpendingPatternsAnalysis({ spendingPatterns, totalSpending }: SpendingPatternsAnalysisProps) {
  const { currencyCode } = useCurrency();
  const formatAmount = (amount: number) => formatCurrency(amount, currencyCode);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Spending Pattern Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Insights from your spending behavior
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spendingPatterns.map((pattern, index) => (
            <motion.div
              key={pattern.pattern}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium capitalize">
                  {pattern.pattern.replace('_', ' & ')}
                </h4>
                <Badge variant={pattern.count > 3 ? "default" : "secondary"}>
                  {pattern.count} expenses
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total spent:</span>
                  <span className="font-medium">{formatAmount(pattern.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Average per expense:</span>
                  <span className="font-medium">{formatAmount(pattern.averageAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">% of total spending:</span>
                  <span className="font-medium">
                    {((pattern.totalAmount / totalSpending) * 100).toFixed(1)}%
                  </span>
                </div>
                
                {pattern.totalAmount * 12 > 5000 && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-xs text-amber-800">
                      💰 This costs you {formatAmount(pattern.totalAmount * 12)} per year
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
