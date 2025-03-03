
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertCircle } from "lucide-react";

interface BudgetSummaryCardsProps {
  totalBudget: number;
  remainingBalance: number;
  usagePercentage: number;
  monthlyIncome: number;
}

export const BudgetSummaryCards = ({ 
  totalBudget, 
  remainingBalance, 
  usagePercentage,
  monthlyIncome
}: BudgetSummaryCardsProps) => {
  const isMobile = useIsMobile();
  const exceedsBudget = totalBudget > monthlyIncome && monthlyIncome > 0;

  return (
    <div className="space-y-3">
      {exceedsBudget && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Warning: Your total budget exceeds your monthly income by {formatCurrency(totalBudget - monthlyIncome)}
          </AlertDescription>
        </Alert>
      )}
      
      <div className={`grid gap-3 md:gap-6 px-4 md:px-0 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
        <Card className="budget-card">
          <CardHeader className="p-2 pb-0">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-xl font-bold">{formatCurrency(totalBudget)}</div>
          </CardContent>
        </Card>
        
        <Card className="budget-card">
          <CardHeader className="p-2 pb-0">
            <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="text-xl font-bold">{formatCurrency(remainingBalance)}</div>
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
            <div className="text-xl font-bold">{formatCurrency(monthlyIncome)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
