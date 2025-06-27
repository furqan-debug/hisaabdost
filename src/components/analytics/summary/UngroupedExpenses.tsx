
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { formatCurrency } from "@/utils/formatters";

interface UngroupedExpensesProps {
  ungroupedExpenses: any[];
}

export function UngroupedExpenses({ ungroupedExpenses }: UngroupedExpensesProps) {
  const { currencyCode } = useCurrency();
  const formatAmount = (amount: number) => formatCurrency(amount, currencyCode);

  if (ungroupedExpenses.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Individual Expenses
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Unique expenses that don't match any patterns ({ungroupedExpenses.length} items)
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {ungroupedExpenses.map((expense, index) => (
            <div key={index} className="flex justify-between items-center p-2 rounded border">
              <div>
                <p className="font-medium text-sm truncate">{expense.description}</p>
                <p className="text-xs text-muted-foreground">{expense.date}</p>
              </div>
              <span className="font-medium">{formatAmount(expense.amount)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
