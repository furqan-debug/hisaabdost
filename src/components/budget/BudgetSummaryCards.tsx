
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <div className={`grid gap-3 md:gap-4 px-2 md:px-0 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[80px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exceedsBudget && (
        <Alert variant="destructive" className="mb-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Warning: Your total budget exceeds your monthly income by {formatCurrency(totalBudget - monthlyIncome, currencyCode)}
          </AlertDescription>
        </Alert>
      )}
      
      <div className={`grid gap-3 md:gap-4 px-2 md:px-0 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="text-xl font-bold text-primary">{formatCurrency(totalBudget, currencyCode)}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/50">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="text-xl font-bold text-primary">{formatCurrency(remainingBalance, currencyCode)}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/50">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="text-xl font-bold text-primary">{usagePercentage.toFixed(1)}%</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/50">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="text-xl font-bold text-primary">{formatCurrency(monthlyIncome, currencyCode)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
