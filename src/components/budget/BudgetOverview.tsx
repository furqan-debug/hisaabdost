
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/chartUtils";
import { Budget } from "@/pages/Budget";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell } from "lucide-react";

interface BudgetOverviewProps {
  budgets: Budget[];
}

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = 0; // TODO: Calculate from expenses
  const usagePercentage = (totalSpent / totalBudget) * 100 || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Spent: {formatCurrency(totalSpent)}</span>
              <span>{usagePercentage.toFixed(1)}%</span>
            </div>
            <Progress value={usagePercentage} />
            <div className="text-xs text-muted-foreground">
              {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)} budget used
            </div>
          </div>
        </CardContent>
      </Card>

      {usagePercentage >= 80 && (
        <Alert variant="destructive">
          <Bell className="h-4 w-4" />
          <AlertTitle>Budget Alert</AlertTitle>
          <AlertDescription>
            You've used {usagePercentage.toFixed(1)}% of your total budget. Consider reviewing your expenses.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
