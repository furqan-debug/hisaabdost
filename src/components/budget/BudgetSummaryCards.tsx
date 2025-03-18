
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertCircle, TrendingDown, TrendingUp, DollarSign, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const exceedsBudget = totalBudget > monthlyIncome && monthlyIncome > 0;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <div className={`grid gap-3 md:gap-6 px-4 md:px-0 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
      </div>
    );
  }

  // Determine status color for budget usage
  const getStatusColor = (percentage: number) => {
    if (percentage > 90) return "text-expense-high";
    if (percentage > 70) return "text-expense-medium";
    return "text-expense-low";
  };

  return (
    <div className="space-y-3">
      {exceedsBudget && (
        <Alert variant="destructive" className="mb-3 shadow-sm animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Warning: Your total budget exceeds your monthly income by {formatCurrency(totalBudget - monthlyIncome)}
          </AlertDescription>
        </Alert>
      )}
      
      <div className={`grid gap-3 md:gap-4 px-4 md:px-0 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
        <Card className="budget-card border-none shadow-md bg-background/60 backdrop-blur-sm overflow-hidden group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-primary opacity-70" />
          </CardHeader>
          <CardContent className="p-3">
            <div className="text-xl font-bold">{formatCurrency(totalBudget)}</div>
          </CardContent>
        </Card>
        
        <Card className="budget-card border-none shadow-md bg-background/60 backdrop-blur-sm overflow-hidden group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className={`h-4 w-4 ${getStatusColor(usagePercentage)}`} />
          </CardHeader>
          <CardContent className="p-3">
            <div className="text-xl font-bold">{formatCurrency(remainingBalance)}</div>
          </CardContent>
        </Card>
        
        <Card className="budget-card border-none shadow-md bg-background/60 backdrop-blur-sm overflow-hidden group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(usagePercentage)} bg-${getStatusColor(usagePercentage).split('-')[1]}/10`}>
              {usagePercentage.toFixed(1)}%
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <div className="w-full bg-muted/50 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full ${getStatusColor(usagePercentage)}`} 
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="budget-card border-none shadow-md bg-background/60 backdrop-blur-sm overflow-hidden group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <Wallet className="h-4 w-4 text-primary opacity-70" />
          </CardHeader>
          <CardContent className="p-3">
            <div className="text-xl font-bold">{formatCurrency(monthlyIncome)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
