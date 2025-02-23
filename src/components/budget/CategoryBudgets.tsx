
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/chartUtils";
import { Budget } from "@/pages/Budget";
import { Pencil } from "lucide-react";

interface CategoryBudgetsProps {
  budgets: Budget[];
  onEditBudget: (budget: Budget) => void;
}

export function CategoryBudgets({ budgets, onEditBudget }: CategoryBudgetsProps) {
  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const spent = 0; // TODO: Calculate from expenses
        const remaining = budget.amount - spent;
        const usagePercentage = (spent / budget.amount) * 100;

        return (
          <Card key={budget.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <h3 className="font-medium">{budget.category}</h3>
                  <p className="text-sm text-muted-foreground">
                    {budget.period} budget
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditBudget(budget)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spent: {formatCurrency(spent)}</span>
                  <span>Remaining: {formatCurrency(remaining)}</span>
                </div>
                <Progress value={usagePercentage} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{usagePercentage.toFixed(1)}% used</span>
                  <span>Budget: {formatCurrency(budget.amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
