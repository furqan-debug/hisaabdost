
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/chartUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface BudgetSummaryCardsProps {
  totalBudget: number;
  remainingBalance: number;
  usagePercentage: number;
}

export const BudgetSummaryCards = ({ 
  totalBudget, 
  remainingBalance, 
  usagePercentage 
}: BudgetSummaryCardsProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`grid gap-3 md:gap-6 px-4 md:px-0 ${isMobile ? 'stat-grid' : 'md:grid-cols-3'}`}>
      <Card className="budget-card">
        <CardHeader className="p-3">
          <CardTitle className="text-base font-medium">Total Budget</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
        </CardContent>
      </Card>
      <Card className="budget-card">
        <CardHeader className="p-3">
          <CardTitle className="text-base font-medium">Remaining Balance</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-2xl font-bold">{formatCurrency(remainingBalance)}</div>
        </CardContent>
      </Card>
      <Card className="budget-card">
        <CardHeader className="p-3">
          <CardTitle className="text-base font-medium">Budget Usage</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="text-2xl font-bold">{usagePercentage.toFixed(1)}%</div>
        </CardContent>
      </Card>
    </div>
  );
};
