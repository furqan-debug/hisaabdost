
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";

interface TopIndividualExpensesProps {
  topSpenders: any[];
}

export function TopIndividualExpenses({ topSpenders }: TopIndividualExpensesProps) {
  const { currencyCode } = useCurrency();
  const formatAmount = (amount: number) => formatCurrency(amount, currencyCode);

  if (topSpenders.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          Biggest Individual Expenses
        </CardTitle>
        <p className="text-sm text-muted-foreground ml-10">
          Your largest single purchases this period
        </p>
      </CardHeader>
      <CardContent className="ml-10">
        <div className="space-y-3">
          {topSpenders.slice(0, 5).map((expense, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-background to-muted/20 border border-border/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-sm border border-primary/20">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-base truncate max-w-[250px]">
                    {expense.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-muted-foreground">{expense.date}</span>
                    <Badge variant="outline" className="text-xs">
                      {expense.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-primary">{formatAmount(expense.amount)}</p>
                <p className="text-sm text-muted-foreground">
                  {expense.percentage.toFixed(1)}% of total
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
