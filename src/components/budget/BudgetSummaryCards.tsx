
import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertCircle, Edit, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BudgetSummaryCardsProps {
  totalBudget: number;
  remainingBalance: number;
  usagePercentage: number;
  monthlyIncome: number;
  isLoading?: boolean;
  onIncomeChange?: (income: number) => Promise<void>;
}

export const BudgetSummaryCards = memo(({ 
  totalBudget, 
  remainingBalance, 
  usagePercentage,
  monthlyIncome,
  isLoading = false,
  onIncomeChange
}: BudgetSummaryCardsProps) => {
  const isMobile = useIsMobile();
  const exceedsBudget = totalBudget > monthlyIncome && monthlyIncome > 0;
  const [isEditing, setIsEditing] = useState(false);
  const [tempIncome, setTempIncome] = useState(monthlyIncome);

  const handleIncomeChange = (value: number) => {
    setTempIncome(value);
  };

  const saveIncome = useCallback(async () => {
    if (onIncomeChange && tempIncome !== monthlyIncome) {
      await onIncomeChange(tempIncome);
    }
    setIsEditing(false);
  }, [tempIncome, monthlyIncome, onIncomeChange]);

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
          <CardHeader className="p-2 pb-0 flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            {onIncomeChange && (
              !isEditing ? (
                <Edit 
                  className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" 
                  onClick={() => setIsEditing(true)}
                />
              ) : (
                <Save 
                  className="h-4 w-4 text-primary cursor-pointer hover:text-primary/80 transition-colors" 
                  onClick={saveIncome}
                />
              )
            )}
          </CardHeader>
          <CardContent className="p-2">
            {!isEditing ? (
              <div className="text-xl font-bold">{formatCurrency(monthlyIncome)}</div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="number"
                  value={tempIncome || 0}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleIncomeChange(value ? parseInt(value, 10) : 0);
                  }}
                  className="h-8 text-sm pr-2"
                  min={0}
                />
                <Button 
                  size="sm" 
                  className="w-full h-7 text-xs" 
                  onClick={saveIncome}
                >
                  Save
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

BudgetSummaryCards.displayName = 'BudgetSummaryCards';
