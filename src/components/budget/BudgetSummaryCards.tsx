
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/utils/formatters";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";

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
  const { currencyCode, version } = useCurrency();
  
  const exceedsBudget = totalBudget > monthlyIncome && monthlyIncome > 0;
  const totalSpent = totalBudget - remainingBalance;

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="w-full grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-[100px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4" key={`budget-summary-${version}`}>
      {exceedsBudget && (
        <Alert variant="destructive" className="rounded-lg w-full bg-destructive/10 border-destructive/20 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Warning: Your budget exceeds monthly income by {formatCurrency(totalBudget - monthlyIncome, currencyCode)}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="w-full grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
        <Card className="budget-glass-card">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-2xl font-bold text-foreground break-words">
              {formatCurrency(totalBudget, currencyCode)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="budget-glass-card">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-2xl font-bold text-foreground break-words">
              {formatCurrency(totalSpent, currencyCode)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="budget-glass-card">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className={`text-2xl font-bold break-words ${remainingBalance < 0 ? 'text-destructive' : 'text-foreground'}`}>
              {formatCurrency(remainingBalance, currencyCode)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="budget-glass-card">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className={`text-2xl font-bold ${usagePercentage > 100 ? 'text-destructive' : 'text-foreground'}`}>
              {usagePercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
