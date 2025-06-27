
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Individual Expenses
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your biggest single expenses this period
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topSpenders.map((expense, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-background to-muted/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium truncate max-w-[200px]">
                    {expense.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{expense.date}</span>
                    <Badge variant="outline" className="text-xs">
                      {expense.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatAmount(expense.amount)}</p>
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
