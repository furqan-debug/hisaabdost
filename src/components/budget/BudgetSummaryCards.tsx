
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/utils/formatters";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const { currencyCode } = useCurrency();
  
  const exceedsBudget = totalBudget > monthlyIncome && monthlyIncome > 0;
  const totalSpent = totalBudget - remainingBalance;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exceedsBudget && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Warning: Your total budget exceeds your monthly income by {formatCurrency(totalBudget - monthlyIncome, currencyCode)}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalBudget, currencyCode)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalSpent, currencyCode)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-2xl font-bold ${remainingBalance < 0 ? 'text-destructive' : 'text-foreground'}`}>
              {formatCurrency(remainingBalance, currencyCode)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={`text-2xl font-bold ${usagePercentage > 100 ? 'text-destructive' : 'text-foreground'}`}>
              {usagePercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
