
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormattedCurrency } from "@/hooks/use-formatted-currency";

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
  const { format } = useFormattedCurrency();
  const exceedsBudget = totalBudget > monthlyIncome && monthlyIncome > 0;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <div className={`grid gap-3 md:gap-6 px-4 md:px-0 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
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
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Warning: Your total budget exceeds your monthly income by {format(totalBudget - monthlyIncome)}
          </AlertDescription>
        </Alert>
      )}
      
      <div className={`grid gap-3 md:gap-6 px-4 md:px-0 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
        <Card className="budget-card">
          <CardHeader className="p-2 pb-0">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-xl font-bold">{format(totalBudget)}</div>
          </CardContent>
        </Card>
        
        <Card className="budget-card">
          <CardHeader className="p-2 pb-0">
            <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-xl font-bold">{format(remainingBalance)}</div>
          </CardContent>
        </Card>
        
        <Card className="budget-card">
          <CardHeader className="p-2 pb-0">
            <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-xl font-bold">{usagePercentage.toFixed(1)}%</div>
          </CardContent>
        </Card>
        
        <Card className="budget-card">
          <CardHeader className="p-2 pb-0">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-xl font-bold">{format(monthlyIncome)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
