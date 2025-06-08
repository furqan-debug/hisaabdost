
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
      <div className="w-full space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="w-full grid gap-3 grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-[100px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {exceedsBudget && (
        <Alert variant="destructive" className="rounded-lg w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Warning: Your total budget exceeds your monthly income by {formatCurrency(totalBudget - monthlyIncome, currencyCode)}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="w-full grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card className="w-full shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2 px-3 pt-3 md:px-4 md:pt-4">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground truncate">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3 md:px-4 md:pb-4">
            <div className="text-base md:text-2xl font-bold text-foreground break-all">
              {formatCurrency(totalBudget, currencyCode)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2 px-3 pt-3 md:px-4 md:pt-4">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground truncate">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3 md:px-4 md:pb-4">
            <div className="text-base md:text-2xl font-bold text-foreground break-all">
              {formatCurrency(totalSpent, currencyCode)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2 px-3 pt-3 md:px-4 md:pt-4">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground truncate">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3 md:px-4 md:pb-4">
            <div className={`text-base md:text-2xl font-bold break-all ${remainingBalance < 0 ? 'text-destructive' : 'text-foreground'}`}>
              {formatCurrency(remainingBalance, currencyCode)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2 px-3 pt-3 md:px-4 md:pt-4">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground truncate">
              Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-3 pb-3 md:px-4 md:pb-4">
            <div className={`text-base md:text-2xl font-bold ${usagePercentage > 100 ? 'text-destructive' : 'text-foreground'}`}>
              {usagePercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
