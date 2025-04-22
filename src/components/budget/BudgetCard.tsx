
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Progress } from "@/components/ui/progress";

interface BudgetCardProps {
  title: string;
  budgeted: number;
  spent: number;
  remaining: number;
  progress: number;
}

export function BudgetCard({ title, budgeted, spent, remaining, progress }: BudgetCardProps) {
  const isOverBudget = spent > budgeted;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Budgeted</p>
            <p className="text-lg font-semibold">{formatCurrency(budgeted)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Spent</p>
            <p className={`text-lg font-semibold ${isOverBudget ? 'text-red-500' : ''}`}>
              {formatCurrency(spent)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className={`text-lg font-semibold ${remaining < 0 ? 'text-red-500' : ''}`}>
              {formatCurrency(remaining)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-lg font-semibold">{progress.toFixed(0)}%</p>
          </div>
        </div>
        
        <Progress
          value={progress}
          className={`w-full h-2 ${isOverBudget ? 'bg-red-200' : ''}`}
          indicatorClassName={isOverBudget ? 'bg-red-500' : undefined}
        />
      </CardContent>
    </Card>
  );
}
